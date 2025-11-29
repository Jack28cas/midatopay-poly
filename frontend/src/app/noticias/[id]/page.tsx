'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import CustomHeader from '@/components/CustomHeader'
import { useLanguage } from '@/contexts/LanguageContext'
import { Calendar, ArrowLeft, Trophy, Building2, Globe } from 'lucide-react'
import { useEffect } from 'react'

export default function NewsArticlePage({ params }: { params: { id: string } }) {
  const { id } = params
  const { t } = useLanguage()

  // Cargar script de Twitter cuando el componente se monte
  useEffect(() => {
    if (id === 'hackathon' || id === 'startupWorldCup') {
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.charset = 'utf-8'
      document.body.appendChild(script)

      return () => {
        // Limpiar script al desmontar
        const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')
        if (existingScript) {
          document.body.removeChild(existingScript)
        }
      }
    }
  }, [id])

  const articles: Record<string, {
    title: string
    date: string
    content: string
    icon: React.ReactNode
    gradient: string
    image?: string
    video?: string
  }> = {
    startupWorldCup: {
      title: t.news.articles.startupWorldCup.title,
      date: t.news.articles.startupWorldCup.date,
      content: t.news.articles.startupWorldCup.content,
      icon: <Globe className="w-8 h-8" style={{ color: '#FF6A00' }} />,
      gradient: 'from-green-500 to-blue-600',
      image: '/noticias/crecimientoar.jpeg'
    },
    startupHouse: {
      title: t.news.articles.startupHouse.title,
      date: t.news.articles.startupHouse.date,
      content: t.news.articles.startupHouse.content,
      icon: <Building2 className="w-8 h-8" style={{ color: '#FF6A00' }} />,
      gradient: 'from-blue-500 to-purple-600',
      image: '/noticias/banner-startup.png'
    },
    hackathon: {
      title: t.news.articles.hackathon.title,
      date: t.news.articles.hackathon.date,
      content: t.news.articles.hackathon.content,
      icon: <Trophy className="w-8 h-8" style={{ color: '#FF6A00' }} />,
      gradient: 'from-orange-500 to-orange-600',
      image: '/noticias/banner-hackaton.png',
      video: '/noticias/midatopay-gana.mp4'
    }
  }

  const article = articles[id]

  if (!article) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
        <CustomHeader />
        <div className="pt-24 pb-16 px-4 text-center">
          <h1 style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}>
            Artículo no encontrado
          </h1>
          <Link href="/noticias" className="text-[#FF6A00]">
            Volver a Noticias
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <CustomHeader />

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link 
              href="/noticias"
              className="inline-flex items-center gap-2 text-[#FF6A00] hover:gap-3 transition-all"
              style={{ fontFamily: 'Kufam, sans-serif' }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t.news.backToNews}</span>
            </Link>
          </motion.div>

          {/* Article Image Banner */}
          {article.image && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 rounded-2xl overflow-hidden shadow-xl"
            >
              <Image
                src={article.image}
                alt={article.title}
                width={1200}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
            </motion.div>
          )}

          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5" style={{ color: '#8B8B8B' }} />
              <span 
                className="text-lg"
                style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif' }}
              >
                {article.date}
              </span>
            </div>

            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
              style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C', lineHeight: '1.2' }}
            >
              {article.title}
            </h1>
          </motion.div>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg max-w-none"
          >
            <div 
              className="text-lg md:text-xl leading-relaxed whitespace-pre-line"
              style={{ 
                color: '#2C2C2C', 
                fontFamily: 'Kufam, sans-serif',
                lineHeight: '1.8'
              }}
            >
              {article.content.split('\n').map((paragraph, index) => {
                // Función para procesar el texto y convertir markdown a HTML
                const processText = (text: string) => {
                  // Reemplazar enlaces específicos
                  let processed = text
                    .replace(/\*\*Cavos\*\*/g, '<strong><a href="https://aegis.cavos.xyz/" target="_blank" rel="noopener noreferrer" style="color: #FF6A00; text-decoration: underline;">Cavos</a></strong>')
                    .replace(/\*\*Starknet Foundation\*\*/g, '<strong><a href="https://www.starknet.io/" target="_blank" rel="noopener noreferrer" style="color: #FF6A00; text-decoration: underline;">Starknet Foundation</a></strong>')
                    .replace(/\*\*Crecimiento Argentina\*\*/g, '<strong><a href="https://crecimiento.build/" target="_blank" rel="noopener noreferrer" style="color: #FF6A00; text-decoration: underline;">Crecimiento Argentina</a></strong>')
                  
                  // Reemplazar otras negritas markdown
                  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  
                  return processed
                }

                return (
                  <p 
                    key={index} 
                    className="mb-6"
                    dangerouslySetInnerHTML={{ __html: processText(paragraph) }}
                  />
                )
              })}
            </div>
          </motion.div>

          {/* Video Section */}
          {article.video && id === 'hackathon' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="my-12"
            >
              <div className="mb-6">
                <h2 
                  className="text-2xl md:text-3xl font-bold mb-3"
                  style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}
                >
                  {t.news.articles.hackathon.videoSection.title}
                </h2>
                <p 
                  className="text-lg"
                  style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif' }}
                >
                  {t.news.articles.hackathon.videoSection.description}
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl bg-black">
                <video
                  src={article.video}
                  controls
                  className="w-full h-auto"
                  style={{ maxHeight: '600px' }}
                >
                  {t.news.articles.hackathon.videoSection.notSupported}
                </video>
              </div>
            </motion.div>
          )}

          {/* Social Media Posts Section - Solo para hackathon */}
          {id === 'hackathon' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="my-12"
            >
              <h2 
                className="text-2xl md:text-3xl font-bold mb-6"
                style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}
              >
                {t.news.articles.hackathon.socialMedia.title}
              </h2>
              
              <div className="flex flex-col gap-8">
                {/* Twitter/X Post */}
                <div className="flex justify-center w-full">
                  <div className="w-full max-w-[550px]">
                    <blockquote className="twitter-tweet" data-theme="light">
                      <p lang="en" dir="ltr">
                        🚀 We're excited to share some amazing news!<br/>
                        MidatoPay won 3rd place at the Starknet Hackathon, among 1,400+ projects worldwide 🌍<br/><br/>
                        Huge thanks to{' '}
                        <a href="https://twitter.com/cavosxyz?ref_src=twsrc%5Etfw">@cavosxyz</a>{' '}
                        <a href="https://twitter.com/StarknetFndn?ref_src=twsrc%5Etfw">@StarknetFndn</a>{' '}
                        <a href="https://twitter.com/crecimientoar?ref_src=twsrc%5Etfw">@crecimientoar</a>{' '}
                        for the support and trust throughout the process.<br/><br/>
                        Design by{' '}
                        <a href="https://twitter.com/ilustracianas?ref_src=twsrc%5Etfw">@ilustracianas</a>{' '}
                        midatopay team{' '}
                        <a href="https://t.co/1HMET0N8lf">pic.twitter.com/1HMET0N8lf</a>
                      </p>
                      &mdash; MidatoPay (@MiDatoPay){' '}
                      <a href="https://twitter.com/MiDatoPay/status/1986237477888127483?ref_src=twsrc%5Etfw">
                        November 6, 2025
                      </a>
                    </blockquote>
                  </div>
                </div>

                {/* LinkedIn Post */}
                <div className="flex justify-center w-full">
                  <div className="w-full max-w-[550px]">
                    <iframe
                      src="https://www.linkedin.com/embed/feed/update/urn:li:share:7392162025029750785?collapsed=1"
                      height="669"
                      width="504"
                      frameBorder="0"
                      allowFullScreen
                      title="Publicación integrada"
                      className="w-full rounded-lg"
                      style={{ 
                        minHeight: '400px',
                        maxHeight: '669px',
                        aspectRatio: '504/669'
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Social Media Posts Section - Solo para startupWorldCup */}
          {id === 'startupWorldCup' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="my-12"
            >
              <div className="flex justify-center w-full">
                <div className="w-full max-w-[550px]">
                  <blockquote className="twitter-tweet" data-theme="light">
                    <p lang="en" dir="ltr">
                      Big news! 🎉<br/>
                      MidatoPay has been selected to compete in the Startup World Cup qualifiers at{' '}
                      <a href="https://twitter.com/AlephHub?ref_src=twsrc%5Etfw">@AlephHub</a>{' '}
                      in Buenos Aires by{' '}
                      <a href="https://twitter.com/crecimientoar?ref_src=twsrc%5Etfw">@crecimientoar</a>
                      <br/><br/>
                      Another step toward our dream of bringing financial inclusion and seamless crypto-fiat payments to all of LATAM 🌎
                      <br/><br/>
                      Grateful to our team{' '}
                      <a href="https://t.co/uFIL30XjSy">pic.twitter.com/uFIL30XjSy</a>
                    </p>
                    &mdash; MidatoPay (@MiDatoPay){' '}
                    <a href="https://twitter.com/MiDatoPay/status/1987607475009524072?ref_src=twsrc%5Etfw">
                      November 9, 2025
                    </a>
                  </blockquote>
                </div>
              </div>
            </motion.div>
          )}

          {/* Back to News Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            <Link 
              href="/noticias"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6A00] text-white hover:bg-[#FF8C42] transition-colors"
              style={{ fontFamily: 'Kufam, sans-serif' }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t.news.backToNews}</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

