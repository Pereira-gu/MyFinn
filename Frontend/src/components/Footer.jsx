import React from 'react';
import { FaLinkedin, FaGithub, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={sectionStyle}>
          <h4>Sobre o MyFinn</h4>
          <p>Este é um <strong>projeto pessoal</strong> desenvolvido para fins de portfólio.</p>
          <p style={disclaimerStyle}>
            ⚠️ <strong>Aviso:</strong> O uso para gestão diária é por sua conta e risco. 
            A aplicação utiliza serviços gratuitos (Render/Neon) que podem ter limitações.
          </p>
        </div>

        <div style={sectionStyle}>
          <h4>Contato & Carreira</h4>
          <p>🚀 <strong>Aberto a novas oportunidades!</strong></p>
          <div style={socialIconsStyle}>
            <a href="https://linkedin.com/in/SEU_USER" target="_blank" rel="noreferrer"><FaLinkedin /></a>
            <a href="https://github.com/SEU_USER" target="_blank" rel="noreferrer"><FaGithub /></a>
            <a href="mailto:seuemail@gmail.com"><FaEnvelope /></a>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer"><FaWhatsapp /></a>
          </div>
        </div>

        <div style={sectionStyle}>
          <h4>Feedbacks</h4>
          <p>Sugestões? Entre em contato por qualquer rede social acima!</p>
        </div>
      </div>
      <div style={copyrightStyle}>
        © {new Date().getFullYear()} MyFinn - Desenvolvido com React e Spring Boot.
      </div>
    </footer>
  );
};

// Estilos básicos (pode mover para o seu App.css)
const footerStyle = { backgroundColor: '#1a1a1a', color: '#fff', padding: '40px 20px', marginTop: '50px' };
const containerStyle = { display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' };
const sectionStyle = { flex: '1', minWidth: '250px', marginBottom: '20px', padding: '0 10px' };
const socialIconsStyle = { fontSize: '24px', display: 'flex', gap: '15px', marginTop: '10px' };
const disclaimerStyle = { fontSize: '0.85rem', color: '#bbb', marginTop: '10px' };
const copyrightStyle = { textAlign: 'center', marginTop: '30px', borderTop: '1px solid #333', paddingTop: '20px', fontSize: '0.9rem' };

export default Footer;