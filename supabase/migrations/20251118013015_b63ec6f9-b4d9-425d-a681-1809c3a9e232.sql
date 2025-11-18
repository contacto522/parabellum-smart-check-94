-- Create blocked_users table
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_rut VARCHAR NOT NULL UNIQUE,
  person_name TEXT,
  block_reason TEXT NOT NULL,
  blocked_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view blocked users"
ON public.blocked_users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert blocked users"
ON public.blocked_users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = blocked_by);

CREATE POLICY "Authenticated users can update blocked users"
ON public.blocked_users
FOR UPDATE
TO authenticated
USING (auth.uid() = blocked_by);

CREATE POLICY "Authenticated users can delete blocked users"
ON public.blocked_users
FOR DELETE
TO authenticated
USING (auth.uid() = blocked_by);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blocked_users_updated_at
BEFORE UPDATE ON public.blocked_users
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();