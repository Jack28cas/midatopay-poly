'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import CustomHeader from '@/components/CustomHeader'
import { useLanguage } from '@/contexts/LanguageContext'
import { Calendar, ArrowLeft, Trophy, Rocket, Building2, Globe } from 'lucide-react'

export default function NewsPage() {
  const { t } = useLanguage()

  const articles = [
    {
      id: 'startupWorldCup',
      title: t.news.articles.startupWorldCup.title,
      date: t.news.articles.startupWorldCup.date,
      excerpt: t.news.articles.startupWorldCup.excerpt,
      content: t.news.articles.startupWorldCup.content,
      icon: <Globe className="w-6 h-6" style={{ color: '#FF6A00' }} />,
      gradient: 'from-green-500 to-blue-600',
      image: '/noticias/crecimientoar.jpeg'
    },
    {
      id: 'startupHouse',
      title: t.news.articles.startupHouse.title,
      date: t.news.articles.startupHouse.date,
      excerpt: t.news.articles.startupHouse.excerpt,
      content: t.news.articles.startupHouse.content,
      icon: <Building2 className="w-6 h-6" style={{ color: '#FF6A00' }} />,
      gradient: 'from-blue-500 to-purple-600',
      image: '/noticias/banner-startup.png'
    },
    {
      id: 'hackathon',
      title: t.news.articles.hackathon.title,
      date: t.news.articles.hackathon.date,
      excerpt: t.news.articles.hackathon.excerpt,
      content: t.news.articles.hackathon.content,
      icon: <Trophy className="w-6 h-6" style={{ color: '#FF6A00' }} />,
      gradient: 'from-orange-500 to-orange-600',
      image: '/noticias/banner-hackaton.png'
    }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <CustomHeader />

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
              style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}
            >
              {t.news.title}
            </h1>
            <p 
              className="text-xl md:text-2xl"
              style={{ fontFamily: 'Kufam, sans-serif', color: '#8B8B8B' }}
            >
              {t.news.subtitle}
            </p>
          </motion.div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Link href={`/noticias/${article.id}`}>
                  <div 
                    className="h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white border border-gray-100"
                    style={{ 
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {/* Image Header */}
                    {article.image ? (
                      <div className="h-48 relative overflow-hidden">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div 
                        className={`h-32 bg-gradient-to-br ${article.gradient} flex items-center justify-center`}
                      >
                        <div className="bg-white rounded-full p-4 shadow-lg">
                          {article.icon}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4" style={{ color: '#8B8B8B' }} />
                        <span 
                          className="text-sm"
                          style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif' }}
                        >
                          {article.date}
                        </span>
                      </div>

                      <h2 
                        className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-[#FF6A00] transition-colors"
                        style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C' }}
                      >
                        {article.title}
                      </h2>

                      <p 
                        className="text-base mb-4 line-clamp-3"
                        style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', lineHeight: '1.6' }}
                      >
                        {article.excerpt}
                      </p>

                      <div className="flex items-center text-[#FF6A00] font-medium group-hover:gap-2 transition-all">
                        <span style={{ fontFamily: 'Kufam, sans-serif' }}>
                          {t.news.readMore}
                        </span>
                        <ArrowLeft className="w-4 h-4 rotate-180 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Empty State (cuando no hay más artículos) */}
          {articles.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Rocket className="w-16 h-16 mx-auto mb-4" style={{ color: '#8B8B8B' }} />
              <p style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif' }}>
                Próximamente más noticias...
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
