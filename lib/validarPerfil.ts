export function validarContacto(correo: string, telefono: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
    return "Ingresá un correo válido.";
  }
  if (!/^\d{4}-?\d{4}$/.test(telefono.trim())) {
    return "Ingresá un teléfono válido de 8 dígitos, por ejemplo 7777-8888.";
  }
  return null;
}

export function validarClave(actual: string, nueva: string, confirmacion: string): string | null {
  if (!actual) return "Ingresá tu contraseña actual.";
  if (nueva.length < 8) return "La nueva contraseña debe tener al menos 8 caracteres.";
  if (!/[A-Za-z]/.test(nueva) || !/\d/.test(nueva)) {
    return "La nueva contraseña debe incluir al menos una letra y un número.";
  }
  if (nueva === actual) return "La nueva contraseña debe ser distinta de la actual.";
  if (nueva !== confirmacion) return "La confirmación no coincide con la nueva contraseña.";
  return null;
}