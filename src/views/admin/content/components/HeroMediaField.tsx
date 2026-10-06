import { useRef, useState, type DragEvent, type ReactNode } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Film, ImagePlus, RefreshCw, Trash2, UploadCloud } from 'lucide-react'

import { Alert, Badge, Button, OptionalMark } from '@/components/ui'
import { FIELD_HINT_CLASS, FIELD_LABEL_CLASS } from '@/components/ui/field.styles'
import { ContentService, type HeroMediaUpload } from '@/services/ContentService'
import { getErrorMessage } from '@/services/errors'
import { cldUrl } from '@/utils/cloudinary'
import { cn } from '@/utils/cn'
import type { HeroMediaFormValue } from '@/views/admin/content/schema/content.schema'

/** Same limits the API enforces (POST /admin/content/hero-media). */
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm'])
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_VIDEO_BYTES = 8 * 1024 * 1024
const MEDIA_ACCEPT = [...IMAGE_TYPES, ...VIDEO_TYPES].join(',')
const IMAGE_ACCEPT = [...IMAGE_TYPES].join(',')

function formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
    return `${(bytes / 1024 / 1024).toLocaleString('es-VE', { maximumFractionDigits: 1 })} MB`
}

/** Client-side check so a wrong file fails at once, naming the file. */
function fileProblem(file: File, imagesOnly: boolean): string | null {
    const isImage = IMAGE_TYPES.has(file.type)
    const isVideo = VIDEO_TYPES.has(file.type)
    if (imagesOnly && !isImage) return `"${file.name}" no es una imagen JPG, PNG, WEBP o AVIF.`
    if (!isImage && !isVideo) {
        return `"${file.name}" no es una imagen (JPG, PNG, WEBP, AVIF) ni un video (MP4, WEBM).`
    }
    if (isImage && file.size > MAX_IMAGE_BYTES) {
        return `"${file.name}" pesa ${formatFileSize(file.size)}; las imágenes pueden pesar hasta 5 MB.`
    }
    if (isVideo && file.size > MAX_VIDEO_BYTES) {
        return `"${file.name}" pesa ${formatFileSize(file.size)}; los videos pueden pesar hasta 8 MB. Acórtalo o comprímelo.`
    }
    return null
}

interface UploadJob {
    file: File
    /** The poster slot: only the `posterUrl` changes. */
    target: 'media' | 'poster'
}

export interface HeroMediaFieldProps {
    value: HeroMediaFormValue | null
    onChange: (value: HeroMediaFormValue | null) => void
    /** Registered alt input (react-hook-form), shown once there is a file. */
    altInput: ReactNode
    error?: string
}

/**
 * Photo or short video of the home hero: drop or choose a file, see it uploading and a preview,
 * add an optional still for videos, or remove it. The upload only stores the file; the
 * storefront changes when the section is saved.
 */
export function HeroMediaField({ value, onChange, altInput, error }: HeroMediaFieldProps) {
    const mediaInput = useRef<HTMLInputElement>(null)
    const posterInput = useRef<HTMLInputElement>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [clientError, setClientError] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)

    const upload = useMutation<HeroMediaUpload, Error, UploadJob>({
        mutationFn: ({ file }) => ContentService.uploadHeroMedia(file, { onProgress: setProgress }),
        onSuccess: (result, { target }) => {
            if (target === 'poster') {
                if (value) onChange({ ...value, posterUrl: result.url })
                return
            }
            onChange({
                type: result.type,
                url: result.url,
                // A new video keeps the still only if it was sent along; an image never has one.
                posterUrl: result.type === 'video' ? result.posterUrl : null,
                alt: value?.alt ?? '',
            })
        },
    })
    const job = upload.isPending ? upload.variables : undefined

    const start = (file: File | undefined, target: UploadJob['target']) => {
        if (!file || upload.isPending) return
        upload.reset()
        const problem = fileProblem(file, target === 'poster')
        setClientError(problem)
        if (problem) return
        setProgress(0)
        upload.mutate({ file, target })
    }

    const onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        setIsDragOver(false)
        start(event.dataTransfer.files[0], 'media')
    }

    const message = clientError ?? (upload.isError ? getErrorMessage(upload.error) : null) ?? error
    const percent = Math.round(progress * 100)

    return (
        <div className="space-y-3">
            <div className="space-y-1">
                <p className={FIELD_LABEL_CLASS}>
                    Imagen o video de portada
                    <OptionalMark />
                </p>
                <p className={FIELD_HINT_CLASS}>
                    Ocupa la tarjeta grande de la portada. Video recomendado: hasta 8 MB, unos 10
                    segundos, vertical 4:5 o cuadrado 1:1, sin sonido. Imagen: de al menos 1200 px
                    de ancho. Sin archivo, la portada muestra tus productos destacados.
                </p>
            </div>

            <input
                ref={mediaInput}
                type="file"
                accept={MEDIA_ACCEPT}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => {
                    start(event.target.files?.[0], 'media')
                    event.target.value = ''
                }}
            />
            <input
                ref={posterInput}
                type="file"
                accept={IMAGE_ACCEPT}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => {
                    start(event.target.files?.[0], 'poster')
                    event.target.value = ''
                }}
            />

            {value ? (
                <div className="grid gap-4 rounded-card border border-line bg-canvas p-4 sm:grid-cols-[11rem_1fr]">
                    <div className="relative aspect-[4/5] w-full max-w-44 overflow-hidden rounded-2xl border border-line bg-surface">
                        {value.type === 'video' ? (
                            <video
                                key={value.url}
                                src={value.url}
                                poster={value.posterUrl ?? undefined}
                                muted
                                loop
                                autoPlay
                                playsInline
                                preload="metadata"
                                aria-label="Vista previa del video de portada"
                                className="size-full object-cover"
                            />
                        ) : (
                            <img
                                src={cldUrl(value.url, 480)}
                                alt="Vista previa de la imagen de portada"
                                width={352}
                                height={440}
                                className="size-full object-cover"
                            />
                        )}
                        <Badge tone="neutral" size="sm" className="absolute top-2 left-2">
                            {value.type === 'video' ? 'Video' : 'Imagen'}
                        </Badge>
                        {job?.target === 'media' ? <UploadOverlay percent={percent} /> : null}
                    </div>

                    <div className="min-w-0 space-y-4">
                        {altInput}

                        {value.type === 'video' ? (
                            <div className="space-y-2">
                                <p className={FIELD_LABEL_CLASS}>
                                    Imagen previa del video
                                    <OptionalMark />
                                </p>
                                <div className="flex flex-wrap items-center gap-3">
                                    {value.posterUrl ? (
                                        <img
                                            src={cldUrl(value.posterUrl, 160)}
                                            alt="Imagen previa del video"
                                            width={64}
                                            height={80}
                                            className="h-20 w-16 rounded-xl border border-line object-cover"
                                        />
                                    ) : null}
                                    <Button
                                        variant="soft"
                                        size="sm"
                                        disabled={upload.isPending}
                                        onClick={() => posterInput.current?.click()}
                                        leadingIcon={
                                            <ImagePlus aria-hidden="true" className="size-4" />
                                        }
                                    >
                                        {job?.target === 'poster'
                                            ? `Subiendo… ${percent}%`
                                            : value.posterUrl
                                              ? 'Cambiar imagen previa'
                                              : 'Subir imagen previa'}
                                    </Button>
                                    {value.posterUrl ? (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={upload.isPending}
                                            onClick={() => onChange({ ...value, posterUrl: null })}
                                        >
                                            Quitar imagen previa
                                        </Button>
                                    ) : null}
                                </div>
                                <p className={FIELD_HINT_CLASS}>
                                    Se ve mientras carga el video y en lugar del video cuando el
                                    visitante ahorra datos o prefiere menos movimiento.
                                </p>
                            </div>
                        ) : null}

                        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={upload.isPending}
                                onClick={() => mediaInput.current?.click()}
                                leadingIcon={<RefreshCw aria-hidden="true" className="size-4" />}
                            >
                                Reemplazar
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={upload.isPending}
                                onClick={() => {
                                    setClientError(null)
                                    upload.reset()
                                    onChange(null)
                                }}
                                leadingIcon={<Trash2 aria-hidden="true" className="size-4" />}
                            >
                                Quitar
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    onDragOver={(event) => {
                        event.preventDefault()
                        if (!upload.isPending) setIsDragOver(true)
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={onDrop}
                    aria-busy={upload.isPending || undefined}
                    className={cn(
                        'flex flex-col items-center gap-3 rounded-card border border-dashed px-6 py-8 text-center transition',
                        isDragOver
                            ? 'border-accent/60 bg-elevated'
                            : 'border-cherry-500/30 bg-canvas',
                        message && 'border-cherry-500',
                    )}
                >
                    {job ? (
                        <>
                            <span
                                aria-hidden="true"
                                className="flex size-12 items-center justify-center rounded-full bg-surface text-accent shadow-soft"
                            >
                                {VIDEO_TYPES.has(job.file.type) ? (
                                    <Film className="size-6" />
                                ) : (
                                    <UploadCloud className="size-6" />
                                )}
                            </span>
                            <p className="font-semibold text-fg">
                                Subiendo {VIDEO_TYPES.has(job.file.type) ? 'el video' : 'la imagen'}
                                … {percent}%
                            </p>
                            <ProgressBar percent={percent} label={job.file.name} />
                            <p className="text-sm text-fg-soft">
                                {job.file.name} · {formatFileSize(job.file.size)}
                            </p>
                        </>
                    ) : (
                        <>
                            <span
                                aria-hidden="true"
                                className="flex size-12 items-center justify-center rounded-full bg-surface text-accent shadow-soft"
                            >
                                <UploadCloud className="size-6" />
                            </span>
                            <p className="font-semibold text-fg">
                                Arrastra una imagen o un video aquí
                            </p>
                            <p className="text-sm text-fg-soft">
                                JPG, PNG, WEBP o AVIF hasta 5 MB · MP4 o WEBM hasta 8 MB
                            </p>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => mediaInput.current?.click()}
                                leadingIcon={<ImagePlus aria-hidden="true" className="size-4" />}
                            >
                                Elegir archivo
                            </Button>
                        </>
                    )}
                </div>
            )}

            {message ? <Alert>{message}</Alert> : null}
            {value || job ? (
                <p className={FIELD_HINT_CLASS}>
                    Los cambios se ven en la tienda cuando guardas esta sección.
                </p>
            ) : null}
        </div>
    )
}

function ProgressBar({ percent, label }: { percent: number; label: string }) {
    return (
        <div
            role="progressbar"
            aria-label={`Subiendo ${label}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-elevated ring-1 ring-line"
        >
            <div
                className="h-full rounded-full bg-cherry-500 transition-[width] duration-200"
                style={{ width: `${percent}%` }}
            />
        </div>
    )
}

/** Over the current preview while its replacement uploads. */
function UploadOverlay({ percent }: { percent: number }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-canvas/80 p-3 text-center backdrop-blur-sm">
            <p className="text-sm font-semibold text-fg">Subiendo… {percent}%</p>
            <ProgressBar percent={percent} label="el nuevo archivo" />
        </div>
    )
}
