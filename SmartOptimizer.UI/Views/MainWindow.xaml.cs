using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.ComponentModel;
using System.IO;
using SmartOptimizer.Core.Managers;
using SmartOptimizer.UI.ViewModels;

namespace SmartOptimizer.UI.Views
{
    public partial class MainWindow : Window
    {
        private readonly MainViewModel _vm;
        private OverlayWindow? _overlay;
        private bool _isRecordingHotkey;

        public MainWindow()
        {
            InitializeComponent();
            _vm = (MainViewModel)DataContext;

            _vm.OverlayStatusUpdated += (status, isActive) => _overlay?.UpdateStatus(status, isActive);
            _vm.OverlayPresetUpdated += preset => _overlay?.UpdatePresetName(preset);

            Loaded += MainWindow_Loaded;
            Closing += MainWindow_Closing;
        }

        private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            try
            {
                await _vm.InitializeAsync();

                // Load initial preset nodes if any
                var active = _vm.Engine.Presets.ActivePreset;
                if (active != null && active.MacroGraph.Count > 0)
                {
                    NodeCanvasControl.LoadGraph(active.MacroGraph);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Initialization error: {ex.Message}", "Smart Optimizer", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void MainWindow_Closing(object? sender, CancelEventArgs e)
        {
            // If overlay is active and visible, let it run independently in the background
            // Only full shutdown when user clicks EXIT SOFTWARE or closes overlay
        }

        private void TopBar_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ChangedButton == MouseButton.Left)
                DragMove();
        }

        private void Minimize_Click(object sender, RoutedEventArgs e)
        {
            WindowState = WindowState.Minimized;
        }

        private void Maximize_Click(object sender, RoutedEventArgs e)
        {
            WindowState = WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
        }

        private void Exit_Click(object sender, RoutedEventArgs e)
        {
            _overlay?.Close();
            _overlay = null;
            _vm.Dispose();
            Application.Current.Shutdown();
        }

        private void NavButton_Click(object sender, RoutedEventArgs e)
        {
            if (sender is not Button btn || btn.Tag is not string pageName)
                return;

            _vm.NavigateCommand.Execute(pageName);

            // Toggle visibility
            Page_Dashboard.Visibility = pageName == "Dashboard" ? Visibility.Visible : Visibility.Collapsed;
            Page_Performance.Visibility = pageName == "Performance" ? Visibility.Visible : Visibility.Collapsed;
            Page_Macro.Visibility = pageName == "Macro" ? Visibility.Visible : Visibility.Collapsed;
            Page_Settings.Visibility = pageName == "Settings" ? Visibility.Visible : Visibility.Collapsed;

            ResetNavStyles();
            btn.Background = new SolidColorBrush(Color.FromArgb(50, 26, 42, 26));
            btn.BorderBrush = new SolidColorBrush(Color.FromRgb(57, 255, 20));
            btn.BorderThickness = new Thickness(1);
            if (btn.Content is StackPanel sp && sp.Children.Count > 1 && sp.Children[1] is TextBlock tb)
                tb.Foreground = new SolidColorBrush(Color.FromRgb(57, 255, 20));
        }

        private void ResetNavStyles()
        {
            var transparent = Brushes.Transparent;
            var inactiveForeground = new SolidColorBrush(Color.FromRgb(160, 174, 192));

            foreach (var b in new[] { BtnDashboard, BtnPerformance, BtnMacro, BtnSettings })
            {
                b.Background = transparent;
                b.BorderThickness = new Thickness(0);
                if (b.Content is StackPanel sp && sp.Children.Count > 1 && sp.Children[1] is TextBlock tb)
                    tb.Foreground = inactiveForeground;
            }
        }

        private async void PresetComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (!string.IsNullOrEmpty(_vm.SelectedPreset))
            {
                await _vm.SwitchPresetCommand.ExecuteAsync(_vm.SelectedPreset);
                var active = _vm.Engine.Presets.ActivePreset;
                if (active != null && active.MacroGraph.Count > 0)
                    NodeCanvasControl.LoadGraph(active.MacroGraph);
            }
        }

        private async void AddEmulator_Click(object sender, RoutedEventArgs e)
        {
            var dialog = new Microsoft.Win32.OpenFileDialog
            {
                Title = "Select Emulator Executable (.exe)",
                Filter = "Emulator Executables (*.exe)|*.exe|All Files (*.*)|*.*",
                InitialDirectory = @"C:\Program Files"
            };

            if (dialog.ShowDialog() == true)
            {
                var defaultName = Path.GetFileNameWithoutExtension(dialog.FileName);
                var customName = PromptInputDialog("Enter Display Name for this emulator:", "Add Emulator", defaultName);
                if (!string.IsNullOrWhiteSpace(customName))
                {
                    await _vm.AddCustomEmulatorAsync(customName.Trim(), dialog.FileName);
                }
            }
        }

        private void RescanEmulators_Click(object sender, RoutedEventArgs e)
        {
            _vm.RefreshInstalledEmulators();
            _vm.AddLog($"[Detector] Scan complete. Found {_vm.InstalledEmulators.Count} emulator(s).");
        }

        private void ClearLogs_Click(object sender, RoutedEventArgs e)
        {
            _vm.Logs.Clear();
        }

        private async void CreatePreset_Click(object sender, RoutedEventArgs e)
        {
            var name = PromptInputDialog("Enter a name for the new profile:", "Create Profile", $"Custom_Profile_{DateTime.Now:HHmmss}");
            if (string.IsNullOrWhiteSpace(name))
                return;

            var newProfile = new PresetProfile
            {
                Name = name.Trim(),
                Description = "Custom User Profile",
                TargetGame = "General",
                MacroGraph = new List<MacroNode>(NodeCanvasControl.Nodes)
            };

            var saved = await _vm.Engine.Presets.SavePresetAsync(newProfile);
            if (saved)
            {
                _vm.RefreshPresets();
                _vm.SelectedPreset = newProfile.Name;
                _vm.AddLog($"[Preset] Created profile: {newProfile.Name}");
            }
        }

        private async void DuplicatePreset_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrEmpty(_vm.SelectedPreset)) return;
            var newName = PromptInputDialog("Enter duplicate profile name:", "Duplicate Profile", $"{_vm.SelectedPreset}_Copy");
            if (string.IsNullOrWhiteSpace(newName)) return;

            var dup = await _vm.Engine.Presets.DuplicatePresetAsync(_vm.SelectedPreset, newName.Trim());
            if (dup)
            {
                _vm.RefreshPresets();
                _vm.SelectedPreset = newName.Trim();
                _vm.AddLog($"[Preset] Duplicated to {newName}");
            }
        }

        private void DeletePreset_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrEmpty(_vm.SelectedPreset)) return;
            if (MessageBox.Show($"Are you sure you want to delete preset '{_vm.SelectedPreset}'?", "Confirm Delete", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
            {
                var del = _vm.Engine.Presets.DeletePreset(_vm.SelectedPreset);
                if (del)
                {
                    _vm.RefreshPresets();
                    _vm.AddLog($"[Preset] Deleted profile.");
                }
            }
        }

        private async void RunMacro_Click(object sender, RoutedEventArgs e)
        {
            if (NodeCanvasControl.Nodes.Count == 0)
            {
                MessageBox.Show("Please add at least one macro action node to the canvas.", "Macro Studio", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            _vm.AddLog($"[Macro] Starting Visual Macro Engine with {NodeCanvasControl.Nodes.Count} node(s)...");

            // Lazy Overlay Trigger: Overlay ONLY appears when Macro is Run
            if (_overlay == null)
            {
                _overlay = new OverlayWindow();
                _overlay.RegisterGlobalHotkey(_vm.OverlayHotkey);
                _overlay.UpdatePresetName(string.IsNullOrEmpty(_vm.SelectedPreset) ? "Active Session" : _vm.SelectedPreset);
                _overlay.EnableAutoHide = _vm.OverlayAutoHide;
            }

            _overlay.UpdateStatus("Macro Active", true);
            _overlay.ShowOverlay();

            await _vm.Engine.Execution.StartExecutionAsync(NodeCanvasControl.Nodes);
        }

        private void StopMacro_Click(object sender, RoutedEventArgs e)
        {
            _vm.AddLog("[Macro] Stopping macro execution...");
            _vm.Engine.Execution.StopExecution();
            _overlay?.UpdateStatus("Macro Paused", false);
        }

        private void ClearMacroBoard_Click(object sender, RoutedEventArgs e)
        {
            NodeCanvasControl.ClearAll();
            _vm.AddLog("[Macro] Canvas cleared.");
        }

        private async void SaveGraph_Click(object sender, RoutedEventArgs e)
        {
            var active = _vm.Engine.Presets.ActivePreset;
            if (active != null)
            {
                active.MacroGraph = new List<MacroNode>(NodeCanvasControl.Nodes);
                await _vm.Engine.Presets.SavePresetAsync(active);
                _vm.AddLog($"[Macro] Graph with {active.MacroGraph.Count} node(s) saved to profile '{active.Name}'.");
                MessageBox.Show($"Macro graph saved to profile '{active.Name}'!", "Macro Studio", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void TxtHotkeyRecorder_GotFocus(object sender, RoutedEventArgs e)
        {
            _isRecordingHotkey = true;
            TxtHotkeyRecorder.Text = "[ Press Any Key... ]";
            TxtHotkeyRecorder.Foreground = new SolidColorBrush(Color.FromRgb(0, 229, 255));
        }

        private void TxtHotkeyRecorder_LostFocus(object sender, RoutedEventArgs e)
        {
            _isRecordingHotkey = false;
            TxtHotkeyRecorder.Text = _vm.OverlayHotkey;
            TxtHotkeyRecorder.Foreground = new SolidColorBrush(Color.FromRgb(57, 255, 20));
        }

        private void TxtHotkeyRecorder_PreviewKeyDown(object sender, KeyEventArgs e)
        {
            if (!_isRecordingHotkey) return;

            var key = e.Key == Key.System ? e.SystemKey : e.Key;
            if (key != Key.None && key != Key.Tab && key != Key.LeftShift && key != Key.RightShift && key != Key.LeftCtrl && key != Key.RightCtrl)
            {
                var keyStr = key.ToString().ToUpperInvariant();
                _vm.OverlayHotkey = keyStr;
                TxtHotkeyRecorder.Text = keyStr;
                _isRecordingHotkey = false;
                e.Handled = true;
                Keyboard.ClearFocus();
            }
        }

        private void SaveHotkey_Click(object sender, RoutedEventArgs e)
        {
            if (_overlay != null)
            {
                _overlay.RegisterGlobalHotkey(_vm.OverlayHotkey);
            }
            _vm.AddLog($"[Overlay] Registered global hotkey: {_vm.OverlayHotkey}");
            MessageBox.Show($"Overlay toggle hotkey '[ {_vm.OverlayHotkey} ]' saved and registered successfully!", "Hotkey Configured", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void OverlayAutoHideCheckBox_Changed(object sender, RoutedEventArgs e)
        {
            if (_overlay != null)
                _overlay.EnableAutoHide = OverlayAutoHideCheckBox.IsChecked == true;
        }

        private string? PromptInputDialog(string message, string title, string defaultText = "")
        {
            var prompt = new Window
            {
                Title = title,
                Width = 400,
                Height = 190,
                WindowStartupLocation = WindowStartupLocation.CenterOwner,
                Owner = this,
                WindowStyle = WindowStyle.None,
                AllowsTransparency = true,
                Background = Brushes.Transparent
            };

            var border = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(20, 20, 26)),
                BorderBrush = new SolidColorBrush(Color.FromRgb(57, 255, 20)),
                BorderThickness = new Thickness(1.5),
                CornerRadius = new CornerRadius(10),
                Padding = new Thickness(20)
            };

            var stack = new StackPanel();
            var txtTitle = new TextBlock
            {
                Text = message,
                Foreground = Brushes.White,
                FontWeight = FontWeights.Bold,
                FontSize = 13,
                Margin = new Thickness(0, 0, 0, 10)
            };

            var input = new TextBox
            {
                Text = defaultText,
                Height = 36,
                Background = new SolidColorBrush(Color.FromRgb(26, 26, 34)),
                Foreground = new SolidColorBrush(Color.FromRgb(57, 255, 20)),
                BorderBrush = new SolidColorBrush(Color.FromRgb(60, 60, 75)),
                Padding = new Thickness(10, 6, 10, 6),
                FontSize = 13,
                FontWeight = FontWeights.Bold
            };

            var btnPanel = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Right,
                Margin = new Thickness(0, 15, 0, 0)
            };

            var btnOk = new Button
            {
                Content = "OK",
                Width = 80,
                Height = 32,
                Background = new SolidColorBrush(Color.FromRgb(22, 43, 22)),
                Foreground = new SolidColorBrush(Color.FromRgb(57, 255, 20)),
                BorderBrush = new SolidColorBrush(Color.FromRgb(57, 255, 20)),
                FontWeight = FontWeights.Bold,
                Cursor = Cursors.Hand,
                IsDefault = true
            };

            var btnCancel = new Button
            {
                Content = "Cancel",
                Width = 80,
                Height = 32,
                Margin = new Thickness(10, 0, 0, 0),
                Background = new SolidColorBrush(Color.FromRgb(40, 22, 22)),
                Foreground = new SolidColorBrush(Color.FromRgb(255, 68, 68)),
                BorderBrush = new SolidColorBrush(Color.FromRgb(255, 68, 68)),
                FontWeight = FontWeights.Bold,
                Cursor = Cursors.Hand,
                IsCancel = true
            };

            string? result = null;
            btnOk.Click += (_, _) => { result = input.Text; prompt.DialogResult = true; prompt.Close(); };
            btnCancel.Click += (_, _) => { prompt.DialogResult = false; prompt.Close(); };

            btnPanel.Children.Add(btnOk);
            btnPanel.Children.Add(btnCancel);
            stack.Children.Add(txtTitle);
            stack.Children.Add(input);
            stack.Children.Add(btnPanel);
            border.Child = stack;
            prompt.Content = border;

            input.Focus();
            input.SelectAll();
            return prompt.ShowDialog() == true ? result : null;
        }
    }
}
