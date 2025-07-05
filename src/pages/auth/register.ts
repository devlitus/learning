import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";
import { registerSchema } from "../../schema/register.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    // Validar campos requeridos
    if (!name || !email || !password || !confirmPassword) {
      return redirect("/register?error=" + encodeURIComponent("Todos los campos son obligatorios"));
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      return redirect("/register?error=" + encodeURIComponent("Las contraseñas no coinciden"));
    }

    // Validar con el schema de Zod
    const validationResult = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => issue.message).join(", ");
      return redirect("/register?error=" + encodeURIComponent(errors));
    }

    // Registrar usuario con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error("Error en registro de Supabase Auth:", authError);
      return redirect("/register?error=" + encodeURIComponent(authError.message));
    }

    if (!authData.user) {
      return redirect("/register?error=" + encodeURIComponent("Error al crear el usuario"));
    }

    // Crear el registro en la tabla user
    const { error: insertError } = await supabase
      .from('user')
      .insert({
        id: authData.user.id,
        email: email,
        name: name,
      });

    if (insertError) {
      console.error("Error al crear el perfil del usuario:", insertError);
      // Intentar eliminar el usuario de auth si falla la creación del perfil
      await supabase.auth.admin.deleteUser(authData.user.id);
      return redirect("/register?error=" + encodeURIComponent("Error al crear el perfil del usuario"));
    }

    // Verificar si el usuario necesita confirmar su email
    if (!authData.session) {
      return redirect("/signin?message=" + encodeURIComponent(
        "Registro exitoso. Por favor, verifica tu email antes de iniciar sesión."
      ));
    }

    // Si el usuario está automáticamente logueado, redirigir al onboarding
    return redirect("/onboarding/level");

  } catch (error) {
    console.error("Error en el registro:", error);
    return redirect("/register?error=" + encodeURIComponent("Error interno del servidor"));
  }
};