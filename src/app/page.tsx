cat > (src / app / page.tsx) << "EOF";
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/welcome");
}
EOF;
