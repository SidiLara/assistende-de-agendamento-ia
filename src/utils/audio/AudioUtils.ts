/**
 * Decodifica uma string base64 em um Uint8Array.
 * @param base64 A string base64 a ser decodificada.
 * @returns Um Uint8Array com os bytes decodificados.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodifica dados de áudio PCM brutos em um AudioBuffer.
 * A API Gemini Live/TTS retorna áudio PCM bruto sem cabeçalhos de arquivo.
 * @param data Os dados de áudio brutos como um Uint8Array.
 * @param ctx O AudioContext a ser usado para criar o buffer.
 * @param sampleRate A taxa de amostragem do áudio (24000 para Gemini TTS).
 * @param numChannels O número de canais de áudio (1 para mono).
 * @returns Uma Promise que resolve para um AudioBuffer.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // O áudio PCM é retornado como inteiros de 16 bits.
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normaliza o valor de 16 bits para um float entre -1.0 e 1.0
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
