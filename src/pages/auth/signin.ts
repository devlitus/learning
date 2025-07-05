import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";
import { authCredentialSchema } from "../../schema/authCredential.schema";
import { setAuthTokens } from "../../utils/serverAuth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    console.log("[SIGNIN] Paso 1: Datos recibidos", { email, password });

    // Validar campos requeridos
    if (!email || !password) {
      console.log("[SIGNIN] Paso 2: Faltan campos requeridos");
      return redirect("/signin?error=" + encodeURIComponent("Correo electrónico y contraseña obligatorios"));
    }

    // Validar con el schema de Zod
    const validationResult = authCredentialSchema.safeParse({
      email,
      password,
    });
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => issue.message).join(", ");
      console.log("[SIGNIN] Paso 3: Error de validación Zod", errors);
      return redirect("/signin?error=" + encodeURIComponent(errors));
    }

    // Iniciar sesión con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log("[SIGNIN] Paso 4: Resultado de signInWithPassword", { data, error });

    if (error) {
      console.error("[SIGNIN] Paso 5: Error en inicio de sesión:", error);
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
      console.log("[SIGNIN] Paso 6: No se obtuvo user o session de Supabase");
      return redirect("/signin?error=" + encodeURIComponent("Error al procesar el inicio de sesión"));
    }

    // Verificar que el usuario existe en la tabla user
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, name, email')
      .eq('id', data.user.id)
      .single();
    console.log("[SIGNIN] Paso 7: Resultado de consulta a tabla user", { userData, userError });

    if (userError || !userData) {
      console.error("[SIGNIN] Paso 8: Error obteniendo datos del usuario:", userError);
      return redirect("/signin?error=" + encodeURIComponent("Error al obtener los datos del usuario"));
    }

    // Guardar tokens en cookies usando las nuevas utilidades
    console.log("[SIGNIN] Paso 9: Guardando tokens con nuevas utilidades");
    setAuthTokens(cookies, data.session.access_token, data.session.refresh_token);

    // Redirigir al onboarding
    console.log("[SIGNIN] Paso 10: Redirigiendo a /onboarding/level");
    return redirect("/onboarding/level");

  } catch (error) {
    console.error("[SIGNIN] Paso 11: Error en el endpoint de signin:", error);
    return redirect("/signin?error=" + encodeURIComponent("Error interno del servidor"));
  }
};