"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { PhotoLightbox } from "@/components/photo-lightbox";
import { deleteEventPhoto } from "@/actions/event-photos";
import type { EventPhoto } from "@/actions/event-photos";

export function EventPhotoGallery({
  photos,
  myAlumniId,
  eventCreatorId,
}: {
  photos: EventPhoto[];
  myAlumniId: string | null;
  eventCreatorId: string;
}) {
  if (photos.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
        Photos ({photos.length})
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.map((photo) => (
          <PhotoTile
            key={photo.id}
            photo={photo}
            canDelete={myAlumniId === photo.alumni_id || myAlumniId === eventCreatorId}
          />
        ))}
      </div>
    </div>
  );
}

function PhotoTile({ photo, canDelete }: { photo: EventPhoto; canDelete: boolean }) {
  const [deleted, setDeleted] = useState(false);
  const [pending, startTransition] = useTransition();

  if (deleted) return null;

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this photo?")) return;
    startTransition(async () => {
      const result = await deleteEventPhoto(photo.id);
      if (!result.error) setDeleted(true);
    });
  }

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-800">
      <PhotoLightbox
        src={photo.signed_url}
        alt={photo.caption ?? `Photo by ${photo.first_name}`}
        trigger={
          <img
            src={photo.signed_url}
            alt={photo.caption ?? `Photo by ${photo.first_name}`}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        }
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-6 opacity-0 transition-opacity group-hover:opacity-100">
        <p className="text-[10px] text-zinc-300 truncate">
          {photo.first_name} {photo.last_name}
        </p>
      </div>
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={pending}
          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-zinc-400 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
          title="Delete photo"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
    </div>
  );
}
