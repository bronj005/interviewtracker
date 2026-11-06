import { Box } from "@/components/ui/Box";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Box className="mx-auto max-w-md p-6 text-center">
      <h1 className="text-lg font-black">Page not found</h1>
      <ButtonLink href="/" variant="primary" className="mt-4">
        Back to calendar
      </ButtonLink>
    </Box>
  );
}
