'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background text-white p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft size={20} />
        Volver
      </button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">Política de Privacidad</h1>
        <p className="text-gray-400 text-sm mb-6">Última actualización: Enero 2025</p>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Introducción</h2>
            <p>
              En Cuadro (operado por Mauto Labs), respetamos tu privacidad y estamos comprometidos
              con la protección de tus datos personales. Esta política explica cómo recopilamos,
              usamos y protegemos tu información de acuerdo con la Ley 1581 de 2012 (Ley de
              Protección de Datos Personales de Colombia) y el RGPD donde aplique.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Responsable del Tratamiento</h2>
            <p>
              <strong>Mauto Labs</strong><br />
              Bogotá, Colombia<br />
              Email: <a href="mailto:mautolabs@gmail.com" className="text-primary hover:underline">
                mautolabs@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Datos que Recopilamos</h2>

            <h3 className="font-medium text-white mt-4 mb-2">3.1 Datos proporcionados por ti:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Información de autenticación (email de Google, nombre)</li>
              <li>Datos financieros que ingresas (ingresos, gastos fijos, gastos variables)</li>
            </ul>

            <h3 className="font-medium text-white mt-4 mb-2">3.2 Datos recopilados automáticamente:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Información del dispositivo (tipo de navegador, sistema operativo)</li>
              <li>Datos de uso anónimos (para mejorar la aplicación)</li>
            </ul>

            <h3 className="font-medium text-white mt-4 mb-2">3.3 Datos que NO recopilamos:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Números de cuentas bancarias</li>
              <li>Números de tarjetas de crédito</li>
              <li>Contraseñas bancarias</li>
              <li>Información tributaria detallada</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Almacenamiento de Datos</h2>
            <p>
              <strong>Almacenamiento en la Nube:</strong> Tus datos financieros (ingresos, gastos fijos,
              gastos variables) se almacenan de forma segura en servidores en la nube mediante Supabase,
              un servicio de base de datos con sede en Estados Unidos y certificación SOC 2 Type II.
              Esto significa que:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Puedes acceder a tus datos desde cualquier dispositivo</li>
              <li>Tus datos están respaldados y protegidos con encriptación</li>
              <li>Si borras los datos del navegador, no pierdes tu información</li>
              <li>Solo tú puedes acceder a tus datos mediante tu cuenta de Google</li>
            </ul>
            <p className="mt-3">
              <strong>Almacenamiento Local:</strong> También mantenemos una copia local en tu
              navegador (localStorage) para mejorar el rendimiento de la aplicación.
            </p>
            <p className="mt-3">
              <strong>Autenticación:</strong> Para Google Sign-In, procesamos tu información
              de perfil público (nombre, email, foto) para identificarte y asociarte con tus datos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Uso de la Información</h2>
            <p>Utilizamos tus datos para:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Proporcionar y mantener el servicio de Cuadro</li>
              <li>Procesar tus registros de gastos mediante inteligencia artificial</li>
              <li>Mejorar y personalizar tu experiencia</li>
              <li>Enviarte comunicaciones importantes sobre el servicio (si lo autorizas)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Inteligencia Artificial</h2>
            <p>
              Cuadro utiliza OpenAI para procesar tus mensajes de gastos en lenguaje natural.
              Cuando escribes un gasto:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>El texto se envía a OpenAI para su interpretación</li>
              <li>No se envían datos personales identificables (nombre, email)</li>
              <li>OpenAI no almacena estos datos según su política de API</li>
              <li>Solo se procesa el texto del gasto, no tu historial completo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Compartición de Datos</h2>
            <p>
              <strong>No vendemos tus datos.</strong> Solo compartimos información con los siguientes
              proveedores de servicios, necesarios para operar la aplicación:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li><strong>Google:</strong> Para autenticación (Google Sign-In)</li>
              <li><strong>Supabase:</strong> Para almacenamiento seguro de tus datos financieros (base de datos en la nube)</li>
              <li><strong>OpenAI:</strong> Para procesar texto de gastos con IA (sin datos personales identificables)</li>
              <li><strong>Vercel:</strong> Hosting de la aplicación</li>
              <li><strong>Autoridades:</strong> Solo si es requerido por ley colombiana</li>
            </ul>
            <p className="mt-3">
              Todos nuestros proveedores cumplen con estándares de seguridad de la industria
              y están obligados contractualmente a proteger tus datos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Tus Derechos</h2>
            <p>Bajo la ley colombiana de protección de datos, tienes derecho a:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre ti</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
              <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos</li>
              <li><strong>Revocación:</strong> Retirar tu consentimiento en cualquier momento</li>
              <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
            </ul>
            <p className="mt-3">
              Para ejercer estos derechos, escríbenos a{' '}
              <a href="mailto:mautolabs@gmail.com" className="text-primary hover:underline">
                mautolabs@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Seguridad</h2>
            <p>
              Implementamos medidas de seguridad para proteger tu información:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Conexiones cifradas (HTTPS/TLS)</li>
              <li>Autenticación segura mediante OAuth 2.0 (Google)</li>
              <li>Base de datos con encriptación en reposo y en tránsito</li>
              <li>Aislamiento de datos por usuario (Row Level Security)</li>
              <li>Almacenamiento local en tu dispositivo</li>
              <li>No almacenamos contraseñas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Menores de Edad</h2>
            <p>
              Cuadro no está dirigido a menores de 18 años. No recopilamos intencionalmente
              datos de menores. Si descubrimos que hemos recopilado datos de un menor,
              los eliminaremos inmediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Cookies y Tecnologías</h2>
            <p>
              Utilizamos localStorage para almacenar tus preferencias y datos de la aplicación.
              No utilizamos cookies de seguimiento de terceros ni publicidad.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">12. Cambios a esta Política</h2>
            <p>
              Podemos actualizar esta política ocasionalmente. Te notificaremos sobre cambios
              significativos mediante la aplicación o por email. La fecha de última actualización
              se indica al inicio de este documento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">13. Contacto</h2>
            <p>
              Para preguntas sobre privacidad o ejercer tus derechos:<br />
              <strong>Email:</strong>{' '}
              <a href="mailto:mautolabs@gmail.com" className="text-primary hover:underline">
                mautolabs@gmail.com
              </a><br />
              <strong>Superintendencia de Industria y Comercio (SIC):</strong>{' '}
              <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                www.sic.gov.co
              </a>
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-xs text-center">
            © 2025 Mauto Labs. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
