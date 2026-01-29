'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
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
        <h1 className="text-2xl font-bold text-primary mb-6">Términos y Condiciones</h1>
        <p className="text-gray-400 text-sm mb-6">Última actualización: Enero 2025</p>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar Cuadro ("la Aplicación"), aceptas estos Términos y Condiciones
              en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debes
              utilizar la Aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Descripción del Servicio</h2>
            <p>
              Cuadro es una aplicación de finanzas personales que te permite:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Registrar tus ingresos mensuales</li>
              <li>Gestionar gastos fijos y variables</li>
              <li>Llevar un control de tu presupuesto</li>
              <li>Registrar gastos mediante lenguaje natural</li>
            </ul>
            <p className="mt-2">
              La Aplicación es una herramienta de organización personal y <strong>no constituye
              asesoría financiera, contable o tributaria</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Registro y Cuenta</h2>
            <p>
              Para usar Cuadro puedes autenticarte mediante Google Sign-In. Al hacerlo:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Garantizas que la información proporcionada es veraz</li>
              <li>Eres responsable de mantener la seguridad de tu cuenta</li>
              <li>Aceptas notificarnos inmediatamente sobre cualquier uso no autorizado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Uso Aceptable</h2>
            <p>Te comprometes a:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Usar la Aplicación solo para fines personales y legales</li>
              <li>No intentar acceder a datos de otros usuarios</li>
              <li>No realizar ingeniería inversa ni modificar la Aplicación</li>
              <li>No usar la Aplicación para actividades fraudulentas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Datos y Privacidad</h2>
            <p>
              Tus datos financieros se almacenan principalmente en tu dispositivo (localStorage).
              Para más detalles sobre cómo manejamos tu información, consulta nuestra{' '}
              <a href="/privacy" className="text-primary hover:underline">Política de Privacidad</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Propiedad Intelectual</h2>
            <p>
              Cuadro y todo su contenido (código, diseño, logos, textos) son propiedad de
              Mauto Labs y están protegidos por las leyes de propiedad intelectual de Colombia
              y tratados internacionales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Limitación de Responsabilidad</h2>
            <p>
              Cuadro se proporciona "tal cual" sin garantías de ningún tipo. No nos hacemos
              responsables por:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Decisiones financieras tomadas basándose en la información de la Aplicación</li>
              <li>Pérdida de datos debido a fallos del dispositivo o navegador</li>
              <li>Interrupciones del servicio o errores técnicos</li>
              <li>Daños directos, indirectos o consecuentes derivados del uso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Los cambios entrarán en vigor inmediatamente después de su publicación.
              El uso continuado de la Aplicación constituye aceptación de los términos modificados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Terminación</h2>
            <p>
              Podemos suspender o terminar tu acceso a la Aplicación en cualquier momento,
              sin previo aviso, si consideramos que has violado estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Ley Aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de la República de Colombia. Cualquier
              disputa será sometida a la jurisdicción de los tribunales de Bogotá, Colombia.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Contacto</h2>
            <p>
              Para preguntas sobre estos términos, contáctanos en:{' '}
              <a href="mailto:legal@mautolabs.com" className="text-primary hover:underline">
                legal@mautolabs.com
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
