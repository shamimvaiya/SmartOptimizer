using System.IO;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Threading;

namespace SmartOptimizer.UI
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            ShutdownMode = ShutdownMode.OnExplicitShutdown;
            DispatcherUnhandledException += OnDispatcherUnhandledException;
            AppDomain.CurrentDomain.UnhandledException += OnUnhandledException;
            TaskScheduler.UnobservedTaskException += OnUnobservedTaskException;
            base.OnStartup(e);
        }

        private void OnDispatcherUnhandledException(object sender, DispatcherUnhandledExceptionEventArgs e)
        {
            LogCrash("UI", e.Exception);
            ShowCrashMessage(e.Exception);
            e.Handled = true;
        }

        private void OnUnhandledException(object? sender, UnhandledExceptionEventArgs e)
        {
            if (e.ExceptionObject is Exception exception)
            {
                LogCrash("Fatal", exception);
                ShowCrashMessage(exception);
            }
        }

        private void OnUnobservedTaskException(object? sender, UnobservedTaskExceptionEventArgs e)
        {
            LogCrash("Task", e.Exception);
            e.SetObserved();
        }

        private static void LogCrash(string source, Exception exception)
        {
            try
            {
                var logPath = Path.Combine(AppContext.BaseDirectory, "crash.log");
                var entry = $"[{DateTime.Now:O}] {source} exception{Environment.NewLine}{exception}{Environment.NewLine}{new string('=', 60)}{Environment.NewLine}";
                File.AppendAllText(logPath, entry);
            }
            catch
            {
            }
        }

        private static void ShowCrashMessage(Exception exception)
        {
            try
            {
                MessageBox.Show(
                    $"{exception.Message}\n\nDetails were written to crash.log next to the application.",
                    "Smart Optimizer Crash",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error);
            }
            catch
            {
            }
        }
    }
}
