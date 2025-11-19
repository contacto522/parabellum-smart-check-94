-- Agregar columnas para detalles de causas penales a la tabla hr_queries
ALTER TABLE public.hr_queries
ADD COLUMN IF NOT EXISTS delito text,
ADD COLUMN IF NOT EXISTS numero_causa text,
ADD COLUMN IF NOT EXISTS tribunal text;

-- Crear índice para búsquedas por RUT
CREATE INDEX IF NOT EXISTS idx_hr_queries_person_rut ON public.hr_queries(person_rut);

-- Crear índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_hr_queries_query_date ON public.hr_queries(query_date DESC);