-- Add unit column to products table
ALTER TABLE public.products 
ADD COLUMN unit TEXT NOT NULL DEFAULT 'UN';