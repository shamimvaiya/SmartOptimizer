import { SnipData } from '../types';

/**
 * SmartOptimizer Master Serialization Service
 * Format: SO_DATA|X:{val}|Y:{val}|W:{val}|H:{val}|IMG:{Base64}
 */

export const SERIALIZATION_HEADER = 'SO_DATA';

export function serializeSnipData(data: SnipData): string {
  const parts = [
    SERIALIZATION_HEADER,
    `X:${Math.round(data.x)}`,
    `Y:${Math.round(data.y)}`,
    `W:${Math.round(data.width)}`,
    `H:${Math.round(data.height)}`,
  ];

  if (data.imageBase64) {
    parts.push(`IMG:${data.imageBase64}`);
  }
  if (data.colorHex) {
    parts.push(`COLOR:${data.colorHex}`);
  }

  return parts.join('|');
}

export function parseSnipData(serialized: string): SnipData | null {
  if (!serialized || typeof serialized !== 'string') return null;
  const trimmed = serialized.trim();

  // Check for SO_DATA prefix
  if (!trimmed.startsWith(SERIALIZATION_HEADER)) {
    // Attempt fallback parsing for plain coords (e.g., "X:100, Y:200, W:300, H:400" or "100, 200, 300, 400")
    const coordsMatch = trimmed.match(/X[:\s=]*(\d+)[\s,;|]+Y[:\s=]*(\d+)[\s,;|]+W[:\s=]*(\d+)[\s,;|]+H[:\s=]*(\d+)/i);
    if (coordsMatch) {
      return {
        x: parseInt(coordsMatch[1], 10),
        y: parseInt(coordsMatch[2], 10),
        width: parseInt(coordsMatch[3], 10),
        height: parseInt(coordsMatch[4], 10),
      };
    }
    const commaMatch = trimmed.match(/^(\d+)[,\s]+(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s]+(#[0-9A-Fa-f]{6}))?/);
    if (commaMatch) {
      return {
        x: parseInt(commaMatch[1], 10),
        y: parseInt(commaMatch[2], 10),
        width: parseInt(commaMatch[3], 10),
        height: parseInt(commaMatch[4], 10),
        colorHex: commaMatch[5] || undefined,
      };
    }
    return null;
  }

  const tokens = trimmed.split('|');
  let x = 0;
  let y = 0;
  let width = 0;
  let height = 0;
  let imageBase64: string | undefined;
  let colorHex: string | undefined;

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.startsWith('X:')) {
      x = parseInt(token.substring(2), 10) || 0;
    } else if (token.startsWith('Y:')) {
      y = parseInt(token.substring(2), 10) || 0;
    } else if (token.startsWith('W:')) {
      width = parseInt(token.substring(2), 10) || 0;
    } else if (token.startsWith('H:')) {
      height = parseInt(token.substring(2), 10) || 0;
    } else if (token.startsWith('IMG:')) {
      // Reassemble in case base64 contained '|' (though standard base64 doesn't)
      imageBase64 = token.substring(4);
    } else if (token.startsWith('COLOR:')) {
      colorHex = token.substring(6);
    }
  }

  return {
    x,
    y,
    width,
    height,
    imageBase64,
    colorHex,
    timestamp: new Date().toISOString(),
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    console.warn('Clipboard writeText failed, falling back to textarea execCommand:', e);
  }

  // Fallback
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(el);
    return successful;
  } catch (err) {
    console.error('Fallback clipboard copy failed:', err);
    return false;
  }
}

export async function readFromClipboard(): Promise<string> {
  try {
    if (navigator?.clipboard?.readText) {
      return await navigator.clipboard.readText();
    }
  } catch (e) {
    console.warn('Clipboard readText failed or permission not granted:', e);
  }
  return '';
}
