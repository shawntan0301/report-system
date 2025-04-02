"use client";

import { useParams } from "next/navigation";

export default function View() {
  const params = useParams();
  const { view } = params as { view: string };
}
