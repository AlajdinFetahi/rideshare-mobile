"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ndryshoOren } from "@/lib/lejet";

export async function ruajOren(formData: FormData) {
  let result: string;
  try {
    const session = await getServerSession(authOptions);
    result = await ndryshoOren(
      session?.user.githubId,
      String(formData.get("id") ?? ""),
      String(formData.get("ora") ?? ""),
    );
  } catch {
    result = "databaza";
  }
  if (result === "sukses") {
    revalidatePath("/");
    revalidatePath(`/udhetimi/${String(formData.get("id"))}`);
    revalidatePath("/panel");
  }
  redirect(`/panel?rezultati=${result}`);
}
