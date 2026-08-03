"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_PROFILE_PHOTO_BYTES } from "@/media/validation";
import styles from "./students.module.css";

type Crop = { left: number; top: number; size: number };

function cropFor(image: HTMLImageElement, zoom: number, positionX: number, positionY: number): Crop {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const square = Math.min(width, height) / zoom;
  return {
    left: ((width - square) * positionX / 100) / width,
    top: ((height - square) * positionY / 100) / height,
    size: square / Math.min(width, height)
  };
}

async function makePreview(image: HTMLImageElement, crop: Crop) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("PREVIEW_UNAVAILABLE");
  const cropPixels = crop.size * Math.min(image.naturalWidth, image.naturalHeight);
  context.drawImage(
    image,
    crop.left * image.naturalWidth,
    crop.top * image.naturalHeight,
    cropPixels,
    cropPixels,
    0,
    0,
    512,
    512
  );
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.8));
  if (!blob) throw new Error("PREVIEW_UNAVAILABLE");
  return URL.createObjectURL(blob);
}

export function StudentPhotoUpload({ studentId }: { studentId: string }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [crop, setCrop] = useState<Crop | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function resetCrop() {
    setCrop(null);
    setStatus("idle");
    setMessage("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  function choose(selected: File | null) {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCrop(null);
    setZoom(1);
    setPositionX(50);
    setPositionY(50);
    if (!selected) {
      setFile(null);
      setSourceUrl(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setStatus("error");
      setMessage("Gunakan foto JPEG, PNG, atau WebP statis.");
      setFile(null);
      setSourceUrl(null);
      return;
    }
    if (selected.size > MAX_PROFILE_PHOTO_BYTES) {
      setStatus("error");
      setMessage("Ukuran foto maksimal 5 MB.");
      setFile(null);
      setSourceUrl(null);
      return;
    }
    setStatus("idle");
    setMessage("");
    setFile(selected);
    setSourceUrl(URL.createObjectURL(selected));
  }

  async function confirmCrop() {
    const image = imageRef.current;
    if (!image) return;
    try {
      const nextCrop = cropFor(image, zoom, positionX, positionY);
      const nextPreview = await makePreview(image, nextCrop);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(nextPreview);
      setCrop(nextCrop);
      setStatus("idle");
      setMessage("Crop siap. Pratinjau ini belum disimpan.");
    } catch {
      setStatus("error");
      setMessage("Pratinjau tidak dapat dibuat. Pilih foto lain lalu coba lagi.");
    }
  }

  async function save() {
    if (!file || !crop) {
      setStatus("error");
      setMessage("Konfirmasikan crop persegi sebelum menyimpan.");
      return;
    }
    setStatus("saving");
    setMessage("Menyimpan foto…");
    const form = new FormData();
    form.set("photo", file);
    form.set("crop", JSON.stringify(crop));
    try {
      const response = await fetch(`/api/operator/students/${encodeURIComponent(studentId)}/photo`, {
        method: "POST",
        body: form
      });
      const payload = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Foto belum dapat disimpan.");
      setStatus("saved");
      setMessage("Foto Siswa berhasil disimpan.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Foto belum dapat disimpan. Silakan coba lagi.");
    }
  }

  function cancel() {
    choose(null);
    setStatus("idle");
    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const objectPosition = `${positionX}% ${positionY}%`;
  return (
    <section className={`${styles.panel} ${styles.photoUpload}`} aria-labelledby="student-photo-upload">
      <div>
        <h2 id="student-photo-upload">Foto profil Siswa</h2>
        <p className={styles.supporting}>Opsional. Foto membantu mengenali Siswa dan bukan bukti identitas.</p>
      </div>
      <label className={styles.field}>
        Pilih foto
        <input
          accept="image/jpeg,image/png,image/webp"
          className={styles.input}
          disabled={status === "saving"}
          onChange={(event) => choose(event.target.files?.[0] ?? null)}
          ref={inputRef}
          type="file"
        />
        <span className={styles.supporting}>JPEG, PNG, atau WebP statis. Maksimal 5 MB.</span>
      </label>
      {sourceUrl ? (
        <div className={styles.cropWorkspace}>
          <div className={styles.cropFrame} aria-label="Area crop persegi">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL crop source */}
            <img
              alt=""
              className={styles.cropImage}
              onError={() => { setStatus("error"); setMessage("File foto tidak dapat dibaca."); }}
              ref={imageRef}
              src={sourceUrl}
              style={{ objectPosition, transform: `scale(${zoom})`, transformOrigin: objectPosition }}
            />
          </div>
          <div className={styles.cropControls}>
            <label className={styles.field}>Zoom
              <input min="1" max="3" onChange={(event) => { setZoom(Number(event.target.value)); resetCrop(); }} step="0.05" type="range" value={zoom} />
            </label>
            <label className={styles.field}>Posisi horizontal
              <input min="0" max="100" onChange={(event) => { setPositionX(Number(event.target.value)); resetCrop(); }} type="range" value={positionX} />
            </label>
            <label className={styles.field}>Posisi vertikal
              <input min="0" max="100" onChange={(event) => { setPositionY(Number(event.target.value)); resetCrop(); }} type="range" value={positionY} />
            </label>
            <button className={styles.secondaryButton} onClick={confirmCrop} type="button">Gunakan crop persegi ini</button>
          </div>
        </div>
      ) : null}
      {previewUrl ? <div className={styles.previewRow}>
        {/* eslint-disable-next-line @next/next/no-img-element -- generated local WebP preview */}
        <img alt="Pratinjau foto yang belum disimpan" className={styles.photoPreview} height="128" src={previewUrl} width="128" />
        <span>Pratinjau hasil crop 1:1</span>
      </div> : null}
      {message ? <p className={status === "error" ? styles.error : styles.message} role={status === "error" ? "alert" : "status"}>{message}</p> : null}
      {file ? <div className={styles.actions}>
        <button className={styles.secondaryButton} disabled={status === "saving"} onClick={cancel} type="button">Batal</button>
        <button className={styles.button} disabled={!crop || status === "saving"} onClick={save} type="button">{status === "saving" ? "Menyimpan…" : "Simpan foto"}</button>
      </div> : null}
    </section>
  );
}
