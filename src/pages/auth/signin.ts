import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";
import { authCredentialSchema } from "../../schema/authCredential.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    // Validar campos requeridos
    if (!email || !password) {
      return redirect("/signin?error=" + encodeURIComponent("Correo electrónico y contraseña obligatorios"));
    }

    // Validar con el schema de Zod
    const validationResult = authCredentialSchema.safeParse({
      email,
      password,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => issue.message).join(", ");
      return redirect("/signin?error=" + encodeURIComponent(errors));
    }

    // Iniciar sesión con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error en inicio de sesión:", error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = "Error al iniciar sesión";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Credenciales inválidas. Verifica tu email y contraseña.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Por favor, verifica tu email antes de iniciar sesión.";
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "Demasiados intentos. Espera unos minutos antes de intentar nuevamente.";
      } else {
        errorMessage = error.message;
      }
      
      return redirect("/signin?error=" + encodeURIComponent(errorMessage));
    }

    if (!data.user || !data.session) {
      return redirect("/signin?error=" + encodeURIComponent("Error al procesar el inicio de sesión"));
    }

    // Verificar que el usuario existe en la tabla user
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, name, email')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      console.error("Error obteniendo datos del usuario:", userError);
      return redirect("/signin?error=" + encodeURIComponent("Error al obtener los datos del usuario"));
    }

    // Guardar tokens en cookies
    const cookieOptions = {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const
    };

    cookies.set("sb-access-token", data.session.access_token, cookieOptions);
    cookies.set("sb-refresh-token", data.session.refresh_token, cookieOptions);
    
    // Redirigir al onboarding
    return redirect("/onboarding/level");

  } catch (error) {
    console.error("Error en el endpoint de signin:", error);
    return redirect("/signin?error=" + encodeURIComponent("Error interno del servidor"));
  }
};