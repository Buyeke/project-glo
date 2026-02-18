-- Allow unauthenticated students to self-register
CREATE POLICY "Students can self-register"
ON public.edu_students
FOR INSERT
WITH CHECK (
  -- Only allow inserting with active org and active semester
  EXISTS (
    SELECT 1 FROM organizations o
    WHERE o.id = organization_id AND o.is_active = true
  )
  AND EXISTS (
    SELECT 1 FROM edu_semesters s
    WHERE s.id = semester_id AND s.is_active = true
  )
);

-- Allow public read of organizations by slug (for registration page lookup)
CREATE POLICY "Public can view active organizations by slug"
ON public.organizations
FOR SELECT
USING (is_active = true);

-- Allow public read of active semesters (for registration page)
CREATE POLICY "Public can view active semesters"
ON public.edu_semesters
FOR SELECT
USING (is_active = true);