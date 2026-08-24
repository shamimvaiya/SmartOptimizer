using OpenCvSharp;
using SmartOptimizer.Core.Engines;

namespace SmartOptimizer.Core.Managers;

public sealed class MacroNode
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string ActionType { get; set; } = "Search Color"; // "Search Color", "Move Mouse", "Click Mouse", "Press Key", "Delay", "ADB Tap", "ADB Shell"
    public string Parameters { get; set; } = string.Empty;
    public double PositionX { get; set; } = 100;
    public double PositionY { get; set; } = 100;
    public List<string> NextNodes { get; set; } = new();
}

public sealed class ColorSearchResult
{
    public required string NodeId { get; init; }
    public required System.Drawing.Point Location { get; init; }
}

public sealed class ExecutionManager : IDisposable
{
    private readonly ScreenCaptureEngine _captureEngine;
    private readonly VisualProcessingEngine _visualEngine;
    private readonly DriverInterface _driverInterface;
    private ADBManager? _adbManager;
    private readonly object _stateLock = new();
    private CancellationTokenSource? _cancellationSource;
    private bool _isRunning;
    private bool _disposed;

    public bool IsRunning
    {
        get
        {
            lock (_stateLock)
            {
                return _isRunning;
            }
        }
    }

    public bool IsDriverConnected => _driverInterface.IsConnected;

    public event EventHandler<ColorSearchResult>? ColorFound;
    public event Action<string>? NodeExecuting;
    public event Action<string>? LogMessage;

    public ExecutionManager(ADBManager? adbManager = null)
    {
        _captureEngine = new ScreenCaptureEngine();
        _visualEngine = new VisualProcessingEngine();
        _driverInterface = new DriverInterface();
        _adbManager = adbManager;
    }

    public void SetAdbManager(ADBManager adbManager)
    {
        _adbManager = adbManager;
    }

    public async Task StartExecutionAsync(
        IReadOnlyList<MacroNode> macroSequence,
        CancellationToken cancellationToken = default)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
        ArgumentNullException.ThrowIfNull(macroSequence);

        if (macroSequence.Count == 0)
            return;

        CancellationTokenSource executionSource;
        lock (_stateLock)
        {
            if (_isRunning)
                return;

            _isRunning = true;
            _cancellationSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            executionSource = _cancellationSource;
        }

        _driverInterface.Connect();
        Log($"Execution started with {macroSequence.Count} node(s). Driver connected: {_driverInterface.IsConnected}");

        try
        {
            await Task.Run(
                () => ExecuteLoop(macroSequence, executionSource.Token),
                executionSource.Token);
        }
        catch (OperationCanceledException) when (executionSource.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
            Log($"Execution loop exception: {ex.Message}");
        }
        finally
        {
            lock (_stateLock)
            {
                _isRunning = false;
                if (ReferenceEquals(_cancellationSource, executionSource))
                    _cancellationSource = null;
            }

            executionSource.Dispose();
            Log("Execution loop stopped.");
        }
    }

    public void StopExecution()
    {
        lock (_stateLock)
        {
            _cancellationSource?.Cancel();
        }
    }

    private void ExecuteLoop(IReadOnlyList<MacroNode> sequence, CancellationToken cancellationToken)
    {
        // Build adjacency dictionary
        var nodeMap = sequence.ToDictionary(n => n.Id, n => n);
        var startNodes = sequence.Where(n => !sequence.Any(other => other.NextNodes.Contains(n.Id))).ToList();
        if (startNodes.Count == 0)
            startNodes = sequence.Take(1).ToList();

        while (!cancellationToken.IsCancellationRequested)
        {
            foreach (var startNode in startNodes)
            {
                ExecuteSubGraph(startNode, nodeMap, cancellationToken);
            }

            cancellationToken.WaitHandle.WaitOne(TimeSpan.FromMilliseconds(16));
        }
    }

    private void ExecuteSubGraph(MacroNode current, Dictionary<string, MacroNode> nodeMap, CancellationToken cancellationToken)
    {
        if (cancellationToken.IsCancellationRequested)
            return;

        NodeExecuting?.Invoke(current.Id);
        var success = ExecuteSingleNode(current, cancellationToken);

        if (current.NextNodes != null && current.NextNodes.Count > 0)
        {
            foreach (var nextId in current.NextNodes)
            {
                if (nodeMap.TryGetValue(nextId, out var nextNode))
                {
                    ExecuteSubGraph(nextNode, nodeMap, cancellationToken);
                }
            }
        }
    }

    private bool ExecuteSingleNode(MacroNode node, CancellationToken cancellationToken)
    {
        try
        {
            switch (node.ActionType.Trim().ToLowerInvariant())
            {
                case "search color":
                case "color search":
                    return ProcessSearchColor(node, cancellationToken);

                case "move mouse":
                    return ProcessMoveMouse(node);

                case "click mouse":
                case "mouse click":
                    return ProcessClickMouse(node);

                case "press key":
                case "key press":
                    return ProcessPressKey(node);

                case "delay":
                case "sleep":
                    return ProcessDelay(node, cancellationToken);

                case "adb tap":
                    return ProcessAdbTap(node);

                case "adb shell":
                    return ProcessAdbShell(node);

                default:
                    Log($"Unknown action type: {node.ActionType}");
                    return false;
            }
        }
        catch (Exception ex)
        {
            Log($"Error executing node '{node.ActionType}': {ex.Message}");
            return false;
        }
    }

    private bool ProcessSearchColor(MacroNode node, CancellationToken cancellationToken)
    {
        var parts = node.Parameters.Split(',', StringSplitOptions.TrimEntries);
        if (parts.Length < 5 ||
            !int.TryParse(parts[0], out var x) ||
            !int.TryParse(parts[1], out var y) ||
            !int.TryParse(parts[2], out var width) ||
            !int.TryParse(parts[3], out var height) ||
            !TryParseHexColor(parts[4], out var targetColor))
            return false;

        var tolerance = 15.0;
        if (parts.Length >= 6 && double.TryParse(parts[5], out var tol))
            tolerance = tol;

        cancellationToken.ThrowIfCancellationRequested();
        var frame = _captureEngine.CaptureRegion(x, y, width, height);
        if (frame.Length == 0)
            return false;

        var location = _visualEngine.FindColor(frame, width, height, targetColor, tolerance);
        if (location is null)
            return false;

        ColorFound?.Invoke(this, new ColorSearchResult
        {
            NodeId = node.Id,
            Location = new System.Drawing.Point(x + location.Value.X, y + location.Value.Y)
        });
        return true;
    }

    private bool ProcessMoveMouse(MacroNode node)
    {
        var parts = node.Parameters.Split(',', StringSplitOptions.TrimEntries);
        if (parts.Length < 2 || !int.TryParse(parts[0], out var x) || !int.TryParse(parts[1], out var y))
            return false;

        var isAbsolute = parts.Length > 2 && bool.TryParse(parts[2], out var abs) && abs;
        return _driverInterface.MoveMouse(x, y, isAbsolute);
    }

    private bool ProcessClickMouse(MacroNode node)
    {
        var param = node.Parameters.Trim().ToLowerInvariant();
        var isRight = param.Contains("right");
        return _driverInterface.Click(!isRight, isRight);
    }

    private bool ProcessPressKey(MacroNode node)
    {
        var key = node.Parameters.Trim().ToUpperInvariant();
        byte vk = key switch
        {
            "HOME" => 0x24,
            "INSERT" => 0x2D,
            "DELETE" => 0x2E,
            "SPACE" => 0x20,
            "ENTER" => 0x0D,
            "CTRL" or "CONTROL" => 0x11,
            "ALT" => 0x12,
            "SHIFT" => 0x10,
            "W" => 0x57,
            "A" => 0x41,
            "S" => 0x53,
            "D" => 0x44,
            "R" => 0x52,
            "E" => 0x45,
            "F" => 0x46,
            "Q" => 0x51,
            "1" => 0x31,
            "2" => 0x32,
            "3" => 0x33,
            _ => byte.TryParse(key, out var raw) ? raw : (byte)0
        };

        if (vk != 0)
            return _driverInterface.SendKey(vk);

        return false;
    }

    private bool ProcessDelay(MacroNode node, CancellationToken cancellationToken)
    {
        if (int.TryParse(node.Parameters.Trim(), out var ms) && ms > 0)
        {
            cancellationToken.WaitHandle.WaitOne(TimeSpan.FromMilliseconds(Math.Clamp(ms, 1, 60_000)));
            return true;
        }
        return false;
    }

    private bool ProcessAdbTap(MacroNode node)
    {
        if (_adbManager == null || _adbManager.ConnectedDevice == null)
            return false;

        var parts = node.Parameters.Split(',', StringSplitOptions.TrimEntries);
        if (parts.Length >= 2 && int.TryParse(parts[0], out var x) && int.TryParse(parts[1], out var y))
        {
            _ = _adbManager.TapAsync(x, y);
            return true;
        }
        return false;
    }

    private bool ProcessAdbShell(MacroNode node)
    {
        if (_adbManager == null || _adbManager.ConnectedDevice == null || string.IsNullOrWhiteSpace(node.Parameters))
            return false;

        _ = _adbManager.ExecuteShellCommandAsync(node.Parameters);
        return true;
    }

    private static bool TryParseHexColor(string value, out Scalar color)
    {
        color = default;
        var hex = value.Trim().TrimStart('#');
        if (hex.Length != 6 ||
            !byte.TryParse(hex[..2], System.Globalization.NumberStyles.HexNumber, null, out var red) ||
            !byte.TryParse(hex[2..4], System.Globalization.NumberStyles.HexNumber, null, out var green) ||
            !byte.TryParse(hex[4..], System.Globalization.NumberStyles.HexNumber, null, out var blue))
            return false;

        color = new Scalar(blue, green, red);
        return true;
    }

    private void Log(string message) => LogMessage?.Invoke($"[Execution] {DateTime.Now:HH:mm:ss} - {message}");

    public void Dispose()
    {
        if (_disposed)
            return;

        StopExecution();
        _driverInterface.Dispose();
        _captureEngine.Dispose();
        _disposed = true;
        GC.SuppressFinalize(this);
    }
}