// src/app/pages/home/home.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './home.html',
})
export class HomeComponent {
  currentFeatureIndex = 0;

  features = [
    {
      icon: '📝',
      title: 'Análise de Texto',
      description:
        'Detecte notícias falsas, conteúdo manipulado e desinformação em textos usando processamento de linguagem natural avançado.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: '🖼️',
      title: 'Detecção de Deepfakes',
      description:
        'Identifique imagens manipuladas e rostos gerados por IA com precisão usando algoritmos de visão computacional.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: '🎥',
      title: 'Verificação de Vídeos',
      description:
        'Analise vídeos para detectar manipulações, edições suspeitas e conteúdo sintético gerado por inteligência artificial.',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: '⚡',
      title: 'Análise em Tempo Real',
      description:
        'Resultados instantâneos com processamento rápido e eficiente, ideal para verificação rápida de conteúdo.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: '🔒',
      title: 'Privacidade Garantida',
      description:
        'Seus dados são processados de forma segura e não são armazenados em nossos servidores.',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: '📊',
      title: 'Relatórios Detalhados',
      description:
        'Receba análises completas com nível de confiança, explicações e recomendações sobre o conteúdo verificado.',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  howItWorks = [
    {
      step: '1',
      title: 'Upload',
      description: 'Envie seu texto, imagem ou vídeo através da nossa interface intuitiva',
      icon: '📤',
    },
    {
      step: '2',
      title: 'Processamento',
      description: 'Nossa IA analisa o conteúdo usando algoritmos avançados de machine learning',
      icon: '🤖',
    },
    {
      step: '3',
      title: 'Verificação',
      description: 'Cruzamento com bases de dados e fontes confiáveis para validação',
      icon: '🔍',
    },
    {
      step: '4',
      title: 'Resultado',
      description: 'Receba um veredito claro com nível de confiança e explicações detalhadas',
      icon: '✅',
    },
  ];

  nextFeature(): void {
    this.currentFeatureIndex = (this.currentFeatureIndex + 1) % this.features.length;
  }

  previousFeature(): void {
    this.currentFeatureIndex =
      this.currentFeatureIndex === 0 ? this.features.length - 1 : this.currentFeatureIndex - 1;
  }

  goToFeature(index: number): void {
    this.currentFeatureIndex = index;
  }
}
