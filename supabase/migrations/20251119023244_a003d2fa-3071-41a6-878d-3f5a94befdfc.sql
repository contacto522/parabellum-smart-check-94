-- Agregar columna para situación legal (libre o privado de libertad)
ALTER TABLE public.hr_queries
ADD COLUMN IF NOT EXISTS situacion_legal text CHECK (situacion_legal IN ('libre', 'privado_libertad'));