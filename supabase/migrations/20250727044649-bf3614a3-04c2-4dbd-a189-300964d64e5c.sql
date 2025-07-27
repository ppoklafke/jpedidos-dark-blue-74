-- Change with_invoice column to boolean type with default false
ALTER TABLE public.orders 
ALTER COLUMN with_invoice TYPE boolean USING (with_invoice = 'com nota'),
ALTER COLUMN with_invoice SET DEFAULT false;