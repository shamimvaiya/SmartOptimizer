using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Effects;
using System.Windows.Shapes;
using SmartOptimizer.Core.Managers;

namespace SmartOptimizer.UI.Components
{
    public partial class NodeCanvas : UserControl
    {
        public List<MacroNode> Nodes { get; } = new();

        private bool isDragging;
        private UIElement? draggedElement;
        private UIElement? dragCapture;
        private Point clickPosition;
        private bool isConnecting;
        private Path? currentWire;
        private Ellipse? sourceSocket;
        private readonly List<Connection> connections = new();
        private bool isPanning;
        private Point panStartPosition;
        private double originX;
        private double originY;
        private Border? activeEditingNodeVisual;
        private MacroNode? activeEditingNodeData;

        private sealed class Connection
        {
            public required Ellipse Source { get; init; }
            public required Ellipse Target { get; init; }
            public required Path Wire { get; init; }
            public required MacroNode SourceNode { get; init; }
            public required MacroNode TargetNode { get; init; }
        }

        public NodeCanvas()
        {
            InitializeComponent();
            MainCanvas.MouseRightButtonDown += (s, e) =>
            {
                var position = e.GetPosition(MainCanvas);
                CreateNode(position.X, position.Y, "Search Color", "860,440,200,200,#39FF14");
                e.Handled = true;
            };
        }

        public void ClearAll()
        {
            Nodes.Clear();
            connections.Clear();
            WireCanvas.Children.Clear();
            var toRemove = MainCanvas.Children.OfType<Border>().Where(b => b.Tag is MacroNode).ToList();
            foreach (var r in toRemove)
                MainCanvas.Children.Remove(r);
            EditPanel.Visibility = Visibility.Collapsed;
        }

        public void LoadGraph(IEnumerable<MacroNode> graph)
        {
            ClearAll();
            var map = new Dictionary<string, (MacroNode Node, Border Visual, Ellipse OutPin, Ellipse InPin)>();

            foreach (var node in graph)
            {
                var (visual, outPin, inPin) = CreateNode(node.PositionX, node.PositionY, node.ActionType, node.Parameters, node);
                map[node.Id] = (node, visual, outPin, inPin);
            }

            // Restore connections
            foreach (var node in graph)
            {
                if (node.NextNodes == null) continue;
                if (!map.TryGetValue(node.Id, out var src)) continue;

                foreach (var nextId in node.NextNodes)
                {
                    if (map.TryGetValue(nextId, out var tgt))
                    {
                        var wire = CreateWirePath();
                        WireCanvas.Children.Add(wire);
                        connections.Add(new Connection
                        {
                            Source = src.OutPin,
                            Target = tgt.InPin,
                            Wire = wire,
                            SourceNode = src.Node,
                            TargetNode = tgt.Node
                        });
                    }
                }
            }

            UpdateWires();
        }

        public (Border Visual, Ellipse OutPin, Ellipse InPin) CreateNode(double x, double y, string actionType = "Search Color", string parameters = "0,0,100,100,#39FF14", MacroNode? existing = null)
        {
            var macroNode = existing ?? new MacroNode
            {
                ActionType = actionType,
                Parameters = parameters,
                PositionX = x,
                PositionY = y
            };

            if (existing == null)
                Nodes.Add(macroNode);

            var accentColor = GetActionColor(macroNode.ActionType);

            var node = new Border
            {
                Width = 200,
                Height = 60,
                Background = new SolidColorBrush(Color.FromRgb(22, 22, 28)),
                BorderBrush = new SolidColorBrush(accentColor),
                BorderThickness = new Thickness(1.5),
                CornerRadius = new CornerRadius(8),
                Tag = macroNode,
                Effect = new DropShadowEffect
                {
                    Color = accentColor,
                    BlurRadius = 12,
                    ShadowDepth = 0,
                    Opacity = 0.35
                }
            };

            var layout = new Grid();
            layout.RowDefinitions.Add(new RowDefinition { Height = new GridLength(60) });

            var header = new Border
            {
                Height = 60,
                Background = new SolidColorBrush(Color.FromArgb(160, 30, 30, 38)),
                CornerRadius = new CornerRadius(7)
            };

            var nodeTitle = new TextBlock
            {
                Text = macroNode.ActionType,
                Foreground = Brushes.White,
                FontWeight = FontWeights.Bold,
                FontSize = 13,
                VerticalAlignment = VerticalAlignment.Center,
                Margin = new Thickness(16, 0, 0, 0)
            };

            var editButton = new Button
            {
                Content = "⚙",
                Width = 36,
                Height = 28,
                Margin = new Thickness(0, 0, 10, 0),
                Background = new SolidColorBrush(Color.FromArgb(40, 255, 255, 255)),
                Foreground = new SolidColorBrush(accentColor),
                BorderBrush = Brushes.Transparent,
                Cursor = Cursors.Hand,
                Tag = macroNode,
                ToolTip = "Configure Node Parameters"
            };

            var inputPin = new Ellipse
            {
                Width = 14,
                Height = 14,
                Fill = new SolidColorBrush(Color.FromRgb(100, 110, 130)),
                Stroke = new SolidColorBrush(Color.FromRgb(22, 22, 28)),
                StrokeThickness = 2,
                ToolTip = "Input Connection",
                Cursor = Cursors.Hand,
                Tag = macroNode
            };

            var outputPin = new Ellipse
            {
                Width = 14,
                Height = 14,
                Fill = new SolidColorBrush(accentColor),
                Stroke = new SolidColorBrush(Color.FromRgb(22, 22, 28)),
                StrokeThickness = 2,
                ToolTip = "Output Connection (Drag to link)",
                Cursor = Cursors.Hand,
                Tag = macroNode
            };

            Grid.SetRow(header, 0);
            layout.Children.Add(header);

            var headerContent = new Grid();
            headerContent.ColumnDefinitions.Add(new ColumnDefinition());
            headerContent.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            Grid.SetColumn(nodeTitle, 0);
            Grid.SetColumn(editButton, 1);
            headerContent.Children.Add(nodeTitle);
            headerContent.Children.Add(editButton);
            header.Child = headerContent;

            var pinCanvas = new Canvas();
            Canvas.SetLeft(inputPin, -7);
            Canvas.SetTop(inputPin, 23);
            Canvas.SetLeft(outputPin, 193);
            Canvas.SetTop(outputPin, 23);
            pinCanvas.Children.Add(inputPin);
            pinCanvas.Children.Add(outputPin);
            layout.Children.Add(pinCanvas);

            outputPin.MouseLeftButtonDown += (s, e) =>
            {
                StartConnection(outputPin, macroNode);
                e.Handled = true;
            };

            inputPin.MouseLeftButtonUp += (s, e) =>
            {
                CompleteConnection(inputPin, macroNode);
                e.Handled = true;
            };

            node.Child = layout;
            Canvas.SetLeft(node, x);
            Canvas.SetTop(node, y);

            header.MouseDown += (s, e) =>
            {
                if (e.ChangedButton != MouseButton.Left)
                    return;

                draggedElement = node;
                dragCapture = header;
                isDragging = true;
                clickPosition = e.GetPosition(node);
                header.CaptureMouse();
                e.Handled = true;
            };

            MainCanvas.Children.Add(node);

            editButton.Click += (s, e) =>
            {
                OpenEditPanel(node, macroNode);
                e.Handled = true;
            };

            return (node, outputPin, inputPin);
        }

        private Color GetActionColor(string actionType)
        {
            return actionType.ToLowerInvariant() switch
            {
                "search color" or "color search" => Color.FromRgb(57, 255, 20),      // Neon Green
                "move mouse" => Color.FromRgb(0, 229, 255),                          // Cyan
                "click mouse" => Color.FromRgb(41, 121, 255),                        // Electric Blue
                "press key" => Color.FromRgb(213, 0, 249),                           // Purple
                "delay" or "sleep" => Color.FromRgb(255, 214, 0),                    // Amber
                "adb tap" or "adb shell" => Color.FromRgb(0, 230, 118),              // Emerald
                _ => Color.FromRgb(57, 255, 20)
            };
        }

        private void OpenEditPanel(Border nodeVisual, MacroNode nodeData)
        {
            activeEditingNodeVisual = nodeVisual;
            activeEditingNodeData = nodeData;

            ComboActionType.SelectedIndex = nodeData.ActionType switch
            {
                "Move Mouse" => 1,
                "Click Mouse" => 2,
                "Press Key" => 3,
                "Delay" => 4,
                "ADB Tap" => 5,
                "ADB Shell" => 6,
                _ => 0
            };

            TxtParameters.Text = nodeData.Parameters;
            UpdateParamHelpText(nodeData.ActionType);
            EditPanel.Visibility = Visibility.Visible;
        }

        private void ClosePanel_Click(object sender, RoutedEventArgs e)
        {
            EditPanel.Visibility = Visibility.Collapsed;
            activeEditingNodeVisual = null;
            activeEditingNodeData = null;
        }

        private void DeleteActiveNode_Click(object sender, RoutedEventArgs e)
        {
            if (activeEditingNodeData != null && activeEditingNodeVisual != null)
            {
                Nodes.Remove(activeEditingNodeData);
                MainCanvas.Children.Remove(activeEditingNodeVisual);

                // Remove wires associated with this node
                var dead = connections.Where(c => c.SourceNode == activeEditingNodeData || c.TargetNode == activeEditingNodeData).ToList();
                foreach (var d in dead)
                {
                    WireCanvas.Children.Remove(d.Wire);
                    connections.Remove(d);
                }

                EditPanel.Visibility = Visibility.Collapsed;
                activeEditingNodeVisual = null;
                activeEditingNodeData = null;
            }
        }

        private void ComboActionType_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (activeEditingNodeData == null || ComboActionType.SelectedItem is not ComboBoxItem item)
                return;

            var action = item.Content?.ToString() ?? "Search Color";
            activeEditingNodeData.ActionType = action;

            if (activeEditingNodeVisual?.Child is Grid grid && grid.Children.Count > 0 && grid.Children[0] is Border header && header.Child is Grid headerGrid && headerGrid.Children[0] is TextBlock title)
            {
                title.Text = action;
                var color = GetActionColor(action);
                activeEditingNodeVisual.BorderBrush = new SolidColorBrush(color);
                if (activeEditingNodeVisual.Effect is DropShadowEffect shadow)
                    shadow.Color = color;
            }

            UpdateParamHelpText(action);
        }

        private void UpdateParamHelpText(string action)
        {
            TxtParamHelp.Text = action switch
            {
                "Search Color" => "Format: X, Y, Width, Height, #HexColor (e.g. 860,440,200,200,#39FF14)",
                "Move Mouse" => "Format: DeltaX, DeltaY, IsAbsolute (e.g. 100, 0, false)",
                "Click Mouse" => "Format: left or right (e.g. left)",
                "Press Key" => "Format: Key name (e.g. HOME, SPACE, R, 1, ENTER)",
                "Delay" => "Format: Milliseconds (e.g. 50, 100, 500)",
                "ADB Tap" => "Format: ScreenX, ScreenY (e.g. 960, 540)",
                "ADB Shell" => "Format: Command string (e.g. input keyevent 4)",
                _ => "Enter parameters"
            };
        }

        private void TxtParameters_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (activeEditingNodeData != null)
                activeEditingNodeData.Parameters = TxtParameters.Text;
        }

        private void TemplateCenter_Click(object sender, RoutedEventArgs e)
        {
            TxtParameters.Text = "860,440,200,200,#39FF14";
        }

        private void TemplateLeftClick_Click(object sender, RoutedEventArgs e)
        {
            TxtParameters.Text = "left";
        }

        private void TemplateDelay_Click(object sender, RoutedEventArgs e)
        {
            TxtParameters.Text = "50";
        }

        private void Board_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ChangedButton == MouseButton.Middle || (e.ChangedButton == MouseButton.Left && (Keyboard.Modifiers & ModifierKeys.Shift) != 0))
            {
                isPanning = true;
                panStartPosition = e.GetPosition(this);
                originX = CanvasTranslate.X;
                originY = CanvasTranslate.Y;
                BoardContainer.CaptureMouse();
                e.Handled = true;
            }
        }

        private void Board_MouseMove(object sender, MouseEventArgs e)
        {
            if (!isPanning)
                return;

            var currentPosition = e.GetPosition(this);
            CanvasTranslate.X = originX + currentPosition.X - panStartPosition.X;
            CanvasTranslate.Y = originY + currentPosition.Y - panStartPosition.Y;
        }

        private void Board_MouseUp(object sender, MouseButtonEventArgs e)
        {
            if (isPanning)
            {
                isPanning = false;
                BoardContainer.ReleaseMouseCapture();
            }
        }

        private void Board_MouseWheel(object sender, MouseWheelEventArgs e)
        {
            if ((Keyboard.Modifiers & ModifierKeys.Control) == 0)
                return;

            var zoomFactor = e.Delta > 0 ? 1.12 : 0.88;
            var newScale = CanvasScale.ScaleX * zoomFactor;
            if (newScale < 0.3 || newScale > 3.0)
                return;

            var mousePosition = e.GetPosition(BoardCanvas);
            CanvasTranslate.X -= mousePosition.X * (zoomFactor - 1) * CanvasScale.ScaleX;
            CanvasTranslate.Y -= mousePosition.Y * (zoomFactor - 1) * CanvasScale.ScaleY;
            CanvasScale.ScaleX = newScale;
            CanvasScale.ScaleY = newScale;
            e.Handled = true;
        }

        private void StartConnection(Ellipse outputSocket, MacroNode sourceNode)
        {
            CancelConnection();
            isConnecting = true;
            sourceSocket = outputSocket;
            currentWire = CreateWirePath();
            WireCanvas.Children.Add(currentWire);
            UpdateWirePath(currentWire, outputSocket, GetSocketCenter(outputSocket));
        }

        private void CompleteConnection(Ellipse inputSocket, MacroNode targetNode)
        {
            if (!isConnecting || sourceSocket == null || currentWire == null)
                return;

            var sourceNode = sourceSocket.Tag as MacroNode;
            if (sourceNode == null || sourceNode == targetNode)
            {
                CancelConnection();
                return;
            }

            if (!sourceNode.NextNodes.Contains(targetNode.Id))
                sourceNode.NextNodes.Add(targetNode.Id);

            connections.Add(new Connection
            {
                Source = sourceSocket,
                Target = inputSocket,
                Wire = currentWire,
                SourceNode = sourceNode,
                TargetNode = targetNode
            });

            isConnecting = false;
            sourceSocket = null;
            currentWire = null;
            UpdateWires();
        }

        private void CancelConnection()
        {
            if (currentWire != null && !connections.Exists(connection => connection.Wire == currentWire))
                WireCanvas.Children.Remove(currentWire);

            isConnecting = false;
            sourceSocket = null;
            currentWire = null;
        }

        private Path CreateWirePath()
        {
            return new Path
            {
                Stroke = new SolidColorBrush(Color.FromRgb(57, 255, 20)),
                StrokeThickness = 2.5,
                IsHitTestVisible = false,
                Effect = new DropShadowEffect
                {
                    Color = Color.FromRgb(57, 255, 20),
                    BlurRadius = 8,
                    ShadowDepth = 0,
                    Opacity = 0.5
                }
            };
        }

        private void UpdateWires()
        {
            foreach (var connection in connections)
            {
                UpdateWirePath(
                    connection.Wire,
                    connection.Source,
                    GetSocketCenter(connection.Target));
            }
        }

        private void UpdateWirePath(Path wire, Ellipse sourceSocket, Point endPoint)
        {
            var startPoint = GetSocketCenter(sourceSocket);
            var horizontalDistance = Math.Max(50, Math.Abs(endPoint.X - startPoint.X) * 0.5);
            var geometry = new PathGeometry();
            var figure = new PathFigure { StartPoint = startPoint };
            figure.Segments.Add(new BezierSegment(
                new Point(startPoint.X + horizontalDistance, startPoint.Y),
                new Point(endPoint.X - horizontalDistance, endPoint.Y),
                endPoint,
                true));
            geometry.Figures.Add(figure);
            wire.Data = geometry;
        }

        private Point GetSocketCenter(Ellipse socket)
        {
            return socket.TranslatePoint(
                new Point(socket.Width / 2, socket.Height / 2),
                MainCanvas);
        }

        protected override void OnMouseMove(MouseEventArgs e)
        {
            base.OnMouseMove(e);
            var currentPosition = e.GetPosition(MainCanvas);

            if (isDragging && draggedElement != null)
            {
                var newX = currentPosition.X - clickPosition.X;
                var newY = currentPosition.Y - clickPosition.Y;
                Canvas.SetLeft(draggedElement, newX);
                Canvas.SetTop(draggedElement, newY);

                if (draggedElement is Border border && border.Tag is MacroNode node)
                {
                    node.PositionX = newX;
                    node.PositionY = newY;
                }

                UpdateWires();
            }

            if (isConnecting && currentWire != null && sourceSocket != null)
            {
                UpdateWirePath(currentWire, sourceSocket, currentPosition);
            }
        }

        protected override void OnMouseUp(MouseButtonEventArgs e)
        {
            base.OnMouseUp(e);
            if (isConnecting)
                CancelConnection();

            if (isDragging)
            {
                dragCapture?.ReleaseMouseCapture();
                isDragging = false;
                draggedElement = null;
                dragCapture = null;
            }
        }
    }
}
