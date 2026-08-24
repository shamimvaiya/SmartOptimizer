using System.Drawing;
using OpenCvSharp;

namespace SmartOptimizer.Core.Engines;

public sealed class VisualProcessingEngine
{
    public System.Drawing.Point? FindColor(
        byte[] frameData,
        int width,
        int height,
        Scalar targetColor,
        double tolerance = 10.0)
    {
        ArgumentNullException.ThrowIfNull(frameData);
        if (width <= 0 || height <= 0)
            throw new ArgumentOutOfRangeException(nameof(width), "Frame dimensions must be positive.");
        if (frameData.Length != width * height * 4)
            throw new ArgumentException("Frame data must contain exactly width * height * 4 BGRA bytes.", nameof(frameData));
        if (tolerance < 0)
            throw new ArgumentOutOfRangeException(nameof(tolerance), "Tolerance cannot be negative.");

        using var frame = new Mat(height, width, MatType.CV_8UC4, frameData);
        var lowerBound = new Scalar(
            Clamp(targetColor.Val0 - tolerance),
            Clamp(targetColor.Val1 - tolerance),
            Clamp(targetColor.Val2 - tolerance),
            0);
        var upperBound = new Scalar(
            Clamp(targetColor.Val0 + tolerance),
            Clamp(targetColor.Val1 + tolerance),
            Clamp(targetColor.Val2 + tolerance),
            255);

        using var mask = new Mat();
        Cv2.InRange(frame, lowerBound, upperBound, mask);

        var moments = Cv2.Moments(mask);
        if (moments.M00 <= 0)
            return null;

        return new System.Drawing.Point(
            (int)(moments.M10 / moments.M00),
            (int)(moments.M01 / moments.M00));
    }

    private static double Clamp(double value) => Math.Clamp(value, 0, 255);
}
