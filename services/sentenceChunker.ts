
export class SentenceChunker {
  private buffer = '';
  private onSentence: (sentence: string) => void;

  constructor(onSentence: (sentence: string) => void) {
    this.onSentence = onSentence;
  }

  addDelta(delta: string): void {
    this.buffer += delta;
    this.extractSentences();
  }

  flush(): void {
    const remaining = this.buffer.trim();
    if (remaining.length > 0) {
      this.onSentence(remaining);
    }
    this.buffer = '';
  }

  reset(): void {
    this.buffer = '';
  }

  private extractSentences(): void {
    // Match sentence-ending punctuation followed by whitespace
    const pattern = /[.!?]+\s/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;

    while ((match = pattern.exec(this.buffer)) !== null) {
      const endPos = match.index + match[0].length;
      const sentence = this.buffer.slice(lastIndex, endPos).trim();

      if (sentence.length >= 10) {
        this.onSentence(sentence);
        lastIndex = endPos;
      }
    }

    if (lastIndex > 0) {
      this.buffer = this.buffer.slice(lastIndex);
    }

    // Safety valve: split at comma/semicolon if buffer gets long without punctuation
    if (this.buffer.length > 200) {
      const commaBreak = this.buffer.lastIndexOf(', ');
      const semicolonBreak = this.buffer.lastIndexOf('; ');
      const breakPoint = Math.max(commaBreak, semicolonBreak);

      if (breakPoint > 20) {
        const chunk = this.buffer.slice(0, breakPoint + 1).trim();
        this.buffer = this.buffer.slice(breakPoint + 2);
        this.onSentence(chunk);
      }
    }
  }
}
