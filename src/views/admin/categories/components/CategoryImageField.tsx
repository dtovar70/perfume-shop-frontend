import { useEffect, useId, useMemo, useRef, useState, type DragEvent } from 'react'
import { ImagePlus, RefreshCw, Trash2, UploadCloud } from 'lucide-react'

import { Alert, Badge, Button, OptionalMark } from '@/components/ui'
import { FIELD_HINT_CLASS, FIELD_LABEL_CLASS } from '@/components/ui/field.styles'
import { cldUrl } from '@/utils/cloudinary'
import { cn } from '@/utils/cn'

/** Same limits the API enforces (`image` on POST/PATCH /admin/categories). */
const CATEGORY_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const CATEGORY_IMAGE_MAX_BYTES = 5 * 1024 * 1024

function formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
    return `${(bytes / 1024 / 1024).toLocaleString('es-VE', { maximumFractionDigits: 1 })} MB`
}

/** Client-side check so a wrong file fails at once, naming the file. */
function fileProblem(file: File): string | null {
    if (!CATEGORY_IMAGE_TYPES.includes(file.type)) {
        return `"${file.name}" no es una imagen JPG, PNG, WebP o AVIF.`
    }
    if (file.size > CATEGORY_IMAGE_MAX_BYTES) {
        return `"${file.name}" pesa ${formatFileSize(file.size)}; la imagen puede pesar hasta 5 MB.`
    }
    return null
}

export interface CategoryImageFieldProps {
    /** The cover saved on the category (null when it has none or was removed here). */
    savedUrl: string | null
    /** A file chosen here, sent when the form is saved. */
    file: File | null
    onFileChange: (file: File) => void
    onRemove: () => void
    disabled?: boolean
}

/**
 * Cover of the category's card in the storefront: drop or choose an image, see a preview (cropped
 * like the card), replace it or remove it. The file travels with the form when it is saved.
 */
export function CategoryImageField({
    savedUrl,
    file,
    onFileChange,
    onRemove,
    disabled = false,
}: CategoryImageFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const hintId = useId()
    const [isDragOver, setIsDragOver] = useState(false)
    const [problem, setProblem] = useState<string | null>(null)

    const fileUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
    useEffect(() => {
        if (!fileUrl) return
        return () => URL.revokeObjectURL(fileUrl)
    }, [fileUrl])
    const shownUrl = fileUrl ?? (savedUrl ? cldUrl(savedUrl, 800) : null)

    const choose = (candidate: File | undefined) => {
        if (!candidate || disabled) return
        const message = fileProblem(candidate)
        setProblem(message)
        if (!message) onFileChange(candidate)
    }

    const onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        setIsDragOver(false)
        choose(event.dataTransfer.files[0])
    }

    return (
        <div className="space-y-3">
            <div className="space-y-1">
                <p className={FIELD_LABEL_CLASS}>
                    Imagen de portada
                    <OptionalMark />
                </p>
                <p id={hintId} className={FIELD_HINT_CLASS}>
                    Horizontal, 1200 px o más · JPG, PNG, WebP o AVIF · máx. 5 MB
                </p>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={CATEGORY_IMAGE_TYPES.join(',')}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => {
                    choose(event.target.files?.[0])
                    event.target.value = ''
                }}
            />

            {shownUrl ? (
                <div className="grid gap-4 rounded-card border border-line bg-canvas p-4 @lg:grid-cols-[16rem_1fr]">
                    <div className="relative aspect-[25/13] w-full max-w-64 overflow-hidden rounded-2xl border border-line bg-surface">
                        <img
                            src={shownUrl}
                            alt="Vista previa de la imagen de portada"
                            width={512}
                            height={266}
                            className="size-full object-cover"
                        />
                        {file ? (
                            <Badge tone="neutral" size="sm" className="absolute top-2 left-2">
                                Sin guardar
                            </Badge>
                        ) : null}
                    </div>

                    <div className="flex min-w-0 flex-col justify-between gap-3">
                        <p className="text-sm break-words text-fg-soft">
                            {file
                                ? `${file.name} · ${formatFileSize(file.size)}. Se sube al guardar.`
                                : 'Se ve en la tarjeta de la categoría en la página de inicio.'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={disabled}
                                onClick={() => inputRef.current?.click()}
                                leadingIcon={<RefreshCw aria-hidden="true" className="size-4" />}
                            >
                                Reemplazar
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={disabled}
                                onClick={() => {
                                    setProblem(null)
                                    onRemove()
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
                        if (!disabled) setIsDragOver(true)
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={onDrop}
                    className={cn(
                        'flex flex-col items-center gap-3 rounded-card border border-dashed px-6 py-7 text-center transition',
                        isDragOver
                            ? 'border-accent/60 bg-elevated'
                            : 'border-cherry-500/30 bg-canvas',
                        problem && 'border-cherry-500',
                    )}
                >
                    <span
                        aria-hidden="true"
                        className="flex size-12 items-center justify-center rounded-full bg-surface text-accent shadow-soft"
                    >
                        <UploadCloud className="size-6" />
                    </span>
                    <p className="font-semibold text-fg">Arrastra una imagen aquí</p>
                    <p className="text-sm text-fg-soft">
                        Sin portada, la tarjeta muestra la foto de un producto de la categoría.
                    </p>
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={disabled}
                        aria-describedby={hintId}
                        onClick={() => inputRef.current?.click()}
                        leadingIcon={<ImagePlus aria-hidden="true" className="size-4" />}
                    >
                        Elegir archivo
                    </Button>
                </div>
            )}

            {problem ? <Alert>{problem}</Alert> : null}
        </div>
    )
}
