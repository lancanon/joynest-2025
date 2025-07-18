export default function Footer() {
  return (
    <footer style={{ 
      backgroundColor: '#333333', 
      height: '40px', 
      width: '100%',
      position: 'fixed',
      bottom: 0,
      left: 0,
      zIndex: 1000
    }}>
      <div className="max-w-7xl mx-auto px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <div style={{ color: 'white', fontSize: '17px', marginLeft: '20px' }}>
            © Joynest
          </div>
        </div>
      </div>
    </footer>
  )
}
