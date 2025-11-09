import React from 'react'
import Footer from './footer'
import Navbar from './Navbar'

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
