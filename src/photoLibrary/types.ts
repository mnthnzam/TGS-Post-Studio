export interface PhotoEntry {
  id: string;            // UUID
  name: string;          // original filename without extension (e.g. "sports-day-2025")
  tags: string[];        // free-text tags, e.g. ["Sports Day 2025", "Grade 5"]
  bucket?: string;       // optional content-bucket association
  blob: Blob;            // full-resolution image binary
  thumbnail: Blob;       // 200×200 preview, generated at upload time
  width: number;         // natural width of original
  height: number;        // natural height of original
  uploadedAt: number;    // Date.now()
  usageCount: number;    // incremented each time this photo is used in a post
}
