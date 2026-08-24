using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;
using System.Windows.Threading;

namespace SmartOptimizer.UI.Views;

public partial class OverlayWindow : Window
{
    private const int WmHotKey = 0x0312;
    private const int HotkeyId = 9000;
    private const uint ModNone = 0;
    private const uint ModAlt = 0x0001;
    private const uint ModControl = 0x0002;
    private const uint ModShift = 0x0004;

    private static readonly IReadOnlyDictionary<string, uint> KeyMap =
        new Dictionary<string, uint>(StringComparer.OrdinalIgnoreCase)
        {
            ["HOME"] = 0x24,
            ["INSERT"] = 0x2D,
            ["F8"] = 0x77,
            ["F9"] = 0x78,
            ["F10"] = 0x79,
            ["F11"] = 0x7A,
            ["F12"] = 0x7B,
            ["DELETE"] = 0x2E,
            ["END"] = 0x23
        };

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint modifiers, uint virtualKey);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool UnregisterHotKey(IntPtr hWnd, int id);

    private readonly DispatcherTimer _autoHideTimer;
    private HwndSource? _hwndSource;
    private bool _isOverlayVisible = true;
    private bool _isHotkeyRegistered;
    private bool _isPointerOver;
    private bool _isClosing;
    private string _currentHotkey = "HOME";

    public bool EnableAutoHide { get; set; } = true;
    public int AutoHideDelaySeconds { get; set; } = 4;
    public double TargetOpacity { get; set; } = 0.92;

    public event Action<bool>? VisibilityChanged;
    public event Action<string>? LogMessage;

    public OverlayWindow()
    {
        InitializeComponent();
        _autoHideTimer = new DispatcherTimer();
        _autoHideTimer.Tick += AutoHideTimer_Tick;
        Loaded += OverlayWindow_Loaded;
        Closing += OverlayWindow_Closing;
        MouseEnter += OverlayWindow_MouseEnter;
        MouseLeave += OverlayWindow_MouseLeave;

        var workArea = SystemParameters.WorkArea;
        Left = Math.Max(20, workArea.Right - Width - 30);
        Top = workArea.Top + 50;
        Opacity = TargetOpacity;
    }

    protected override void OnSourceInitialized(EventArgs e)
    {
        base.OnSourceInitialized(e);
        var handle = new WindowInteropHelper(this).Handle;
        _hwndSource = HwndSource.FromHwnd(handle);
        _hwndSource?.AddHook(HwndHook);
        RegisterGlobalHotkey(_currentHotkey);
    }

    public bool RegisterGlobalHotkey(string keyName, bool ctrl = false, bool alt = false, bool shift = false)
    {
        UnregisterGlobalHotkey();
        if (!KeyMap.TryGetValue(keyName, out var virtualKey))
        {
            keyName = "HOME";
            virtualKey = KeyMap[keyName];
        }

        _currentHotkey = keyName;
        var modifiers = ModNone;
        if (ctrl) modifiers |= ModControl;
        if (alt) modifiers |= ModAlt;
        if (shift) modifiers |= ModShift;

        var handle = new WindowInteropHelper(this).Handle;
        if (handle == IntPtr.Zero || !RegisterHotKey(handle, HotkeyId, modifiers, virtualKey))
        {
            Log($"Failed to register global hotkey: {keyName}.");
            return false;
        }

        _isHotkeyRegistered = true;
        UpdateHotkeyHint($"[{keyName}] Toggle HUD");
        Log($"Global hotkey registered: {keyName}");
        return true;
    }

    public void UnregisterGlobalHotkey()
    {
        if (!_isHotkeyRegistered)
            return;

        var handle = new WindowInteropHelper(this).Handle;
        if (handle != IntPtr.Zero)
            UnregisterHotKey(handle, HotkeyId);
        _isHotkeyRegistered = false;
    }

    public void ToggleOverlay()
    {
        if (_isOverlayVisible)
            HideOverlay();
        else
            ShowOverlay();
    }

    public void ShowOverlay()
    {
        if (_isClosing)
            return;

        _autoHideTimer.Stop();
        Visibility = Visibility.Visible;
        BeginAnimation(OpacityProperty, new DoubleAnimation
        {
            From = Opacity,
            To = TargetOpacity,
            Duration = TimeSpan.FromMilliseconds(200)
        });
        _isOverlayVisible = true;
        VisibilityChanged?.Invoke(true);
        ResetAutoHideTimer();
    }

    public void HideOverlay()
    {
        _autoHideTimer.Stop();
        if (!_isOverlayVisible)
            return;

        var fadeOut = new DoubleAnimation
        {
            From = Opacity,
            To = 0,
            Duration = TimeSpan.FromMilliseconds(250)
        };
        fadeOut.Completed += (_, _) =>
        {
            if (_isClosing)
                return;
            Visibility = Visibility.Hidden;
            _isOverlayVisible = false;
            VisibilityChanged?.Invoke(false);
        };
        BeginAnimation(OpacityProperty, fadeOut);
    }

    public void UpdateStatus(string statusText, bool isActive)
    {
        RunOnUiThread(() =>
        {
            TxtStatus.Text = statusText;
            var color = isActive ? Color.FromRgb(0x39, 0xFF, 0x14) : Color.FromRgb(0xFF, 0x44, 0x44);
            StatusDot.Fill = new SolidColorBrush(color);
            MainBorder.BorderBrush = new SolidColorBrush(color);
            if (StatusDot.Effect is DropShadowEffect shadow)
                shadow.Color = color;
            if (MainBorder.Effect is DropShadowEffect borderShadow)
                borderShadow.Color = color;
        });
    }

    public void UpdatePresetName(string presetName)
    {
        RunOnUiThread(() => TxtPreset.Text = $"Preset: {presetName}");
    }

    public void UpdateHotkeyHint(string hintText)
    {
        RunOnUiThread(() => TxtHotkeyHint.Text = hintText);
    }

    private void MainBorder_MouseDown(object sender, MouseButtonEventArgs e)
    {
        if (e.ChangedButton != MouseButton.Left)
            return;

        try
        {
            DragMove();
            ClampToWorkingArea();
        }
        catch { }
        ResetAutoHideTimer();
    }

    private void CloseOverlay_Click(object sender, RoutedEventArgs e)
    {
        HideOverlay();
    }

    private IntPtr HwndHook(IntPtr hwnd, int message, IntPtr wParam, IntPtr lParam, ref bool handled)
    {
        if (message == WmHotKey && wParam.ToInt32() == HotkeyId)
        {
            ToggleOverlay();
            handled = true;
        }
        return IntPtr.Zero;
    }

    private void OverlayWindow_Loaded(object sender, RoutedEventArgs e)
    {
        ClampToWorkingArea();
        ResetAutoHideTimer();
    }

    private void AutoHideTimer_Tick(object? sender, EventArgs e)
    {
        _autoHideTimer.Stop();
        if (EnableAutoHide && _isOverlayVisible && !_isPointerOver)
            HideOverlay();
    }

    private void OverlayWindow_MouseEnter(object sender, MouseEventArgs e)
    {
        _isPointerOver = true;
        _autoHideTimer.Stop();
    }

    private void OverlayWindow_MouseLeave(object sender, MouseEventArgs e)
    {
        _isPointerOver = false;
        if (_isOverlayVisible)
            ResetAutoHideTimer();
    }

    private void ResetAutoHideTimer()
    {
        _autoHideTimer.Stop();
        if (EnableAutoHide && AutoHideDelaySeconds > 0 && !_isPointerOver)
        {
            _autoHideTimer.Interval = TimeSpan.FromSeconds(Math.Clamp(AutoHideDelaySeconds, 1, 60));
            _autoHideTimer.Start();
        }
    }

    private void ClampToWorkingArea()
    {
        var workArea = SystemParameters.WorkArea;
        Left = Math.Clamp(Left, workArea.Left, Math.Max(workArea.Left, workArea.Right - ActualWidth));
        Top = Math.Clamp(Top, workArea.Top, Math.Max(workArea.Top, workArea.Bottom - ActualHeight));
    }

    private void OverlayWindow_Closing(object? sender, System.ComponentModel.CancelEventArgs e)
    {
        _isClosing = true;
        _autoHideTimer.Stop();
        UnregisterGlobalHotkey();
        _hwndSource?.RemoveHook(HwndHook);
        _hwndSource?.Dispose();
        _hwndSource = null;
    }

    private void RunOnUiThread(Action action)
    {
        if (Dispatcher.CheckAccess())
            action();
        else
            Dispatcher.BeginInvoke(action);
    }

    private void Log(string message) => LogMessage?.Invoke($"[Overlay] {DateTime.Now:HH:mm:ss} - {message}");
}
