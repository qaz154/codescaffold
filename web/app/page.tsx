'use client';

import { useState } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  features: string[];
  tech: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'nextjs-fullstack',
    name: 'Next.js Full-Stack',
    description: 'Next.js 15 + Express + Prisma + PostgreSQL',
    features: ['React', 'TypeScript', 'Prisma', 'TailwindCSS'],
    tech: 'nextjs-fullstack',
  },
  {
    id: 'express-api',
    name: 'Express REST API',
    description: 'Express + Prisma + PostgreSQL/MySQL',
    features: ['Node.js', 'TypeScript', 'Prisma', 'Vitest'],
    tech: 'express-api',
  },
  {
    id: 'python-fastapi',
    name: 'Python FastAPI',
    description: 'FastAPI + SQLAlchemy + Alembic + PostgreSQL',
    features: ['Python', 'Pydantic', 'SQLAlchemy', 'Pytest'],
    tech: 'python-fastapi',
  },
  {
    id: 'go-microservice',
    name: 'Go Microservice',
    description: 'Go 1.22 + Gin + pgx + PostgreSQL',
    features: ['Go', 'Gin', 'pgx', 'Docker'],
    tech: 'go-microservice',
  },
];

interface FormData {
  projectName: string;
  description: string;
  author: string;
  template: string;
  requirement: string;
  useAi: boolean;
}

export default function HomePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    description: '',
    author: '',
    template: '',
    requirement: '',
    useAi: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [analysis, setAnalysis] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRequirementSubmit = async () => {
    if (!formData.requirement.trim()) return;

    setIsGenerating(true);
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const req = formData.requirement.toLowerCase();
    let detectedTemplate = 'express-api';
    let detectedDb = 'PostgreSQL';
    const features: string[] = [];

    if (req.includes('nextjs') || req.includes('next.js') || req.includes('react')) {
      detectedTemplate = 'nextjs-fullstack';
    } else if (req.includes('python') || req.includes('fastapi') || req.includes('django')) {
      detectedTemplate = 'python-fastapi';
    } else if (req.includes('go') || req.includes('golang') || req.includes('微服务')) {
      detectedTemplate = 'go-microservice';
    }

    if (req.includes('auth') || req.includes('登录') || req.includes('注册')) {
      features.push('Authentication');
    }
    if (req.includes('crud') || req.includes('用户')) {
      features.push('CRUD');
    }
    if (req.includes('mysql')) {
      detectedDb = 'MySQL';
    }

    setAnalysis({
      'Project Type': TEMPLATES.find((t) => t.tech === detectedTemplate)?.name || detectedTemplate,
      'Database': detectedDb,
      'Features': features.length > 0 ? features.join(', ') : 'Basic CRUD',
    });

    setFormData((prev) => ({ ...prev, template: detectedTemplate, useAi: true }));
    setIsGenerating(false);
    setStep(2);
  };

  const handleGenerate = async () => {
    if (!formData.projectName.trim() || !formData.template) return;

    setIsGenerating(true);
    setStep(3);

    // Simulate generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsGenerating(false);
    setGenerated(true);
  };

  const renderStep1 = () => (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Describe Your Project
      </h2>
      <div className="form-group">
        <label>What do you want to build?</label>
        <textarea
          value={formData.requirement}
          onChange={(e) => handleInputChange('requirement', e.target.value)}
          placeholder="Example: A user management system with login, registration, and admin dashboard using Next.js"
        />
      </div>
      <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
        You can describe your project in English or Chinese. Our AI will analyze your requirements.
      </p>
      <div className="btn-group">
        <div />
        <button
          className="btn btn-primary"
          onClick={handleRequirementSubmit}
          disabled={!formData.requirement.trim() || isGenerating}
        >
          {isGenerating ? 'Analyzing...' : 'Analyze & Continue'}
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Configure Your Project
      </h2>

      <div className="analysis-result">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#06b6d4' }}>
          AI Analysis Results
        </h3>
        {Object.entries(analysis).map(([key, value]) => (
          <div key={key} className="analysis-item">
            <span className="analysis-label">{key}</span>
            <span className="analysis-value">{value}</span>
          </div>
        ))}
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>Project Name</label>
        <input
          type="text"
          value={formData.projectName}
          onChange={(e) => handleInputChange('projectName', e.target.value)}
          placeholder="my-awesome-project"
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="A brief description of your project"
        />
      </div>

      <div className="form-group">
        <label>Author</label>
        <input
          type="text"
          value={formData.author}
          onChange={(e) => handleInputChange('author', e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div className="form-group">
        <label>Select Template</label>
        <div className="template-grid">
          {TEMPLATES.map((template) => (
            <div
              key={template.id}
              className={`template-card ${formData.template === template.tech ? 'selected' : ''}`}
              onClick={() => handleInputChange('template', template.tech)}
            >
              <div className="template-name">{template.name}</div>
              <div className="template-description">{template.description}</div>
              <div className="template-features">
                {template.features.map((f) => (
                  <span key={f} className="feature-tag">{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="btn-group">
        <button className="btn btn-secondary" onClick={() => setStep(1)}>
          Back
        </button>
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={!formData.projectName.trim() || !formData.template || isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Project'}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Generating Your Project
      </h2>

      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: isGenerating ? '70%' : generated ? '100%' : '30%' }}
          />
        </div>
        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>
          {isGenerating ? 'Generating project files...' : generated ? 'Complete!' : 'Preparing...'}
        </p>
      </div>

      {generated && (
        <div className="success-message">
          <div className="success-icon">🎉</div>
          <div className="success-title">Project Generated!</div>
          <div className="success-description">
            Your project <strong>{formData.projectName}</strong> has been created successfully.
          </div>
          <div className="code-block">
            cd {formData.projectName}
            {'\n'}
            {formData.template?.includes('python') ? 'pip install -e ".[dev]"' : 'npm install'}
            {'\n'}
            {formData.template?.includes('python')
              ? 'uvicorn app.main:app --reload'
              : formData.template?.includes('go')
              ? 'go run cmd/server/main.go'
              : 'npm run dev'}
          </div>
          <div className="btn-group" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>
              Create Another
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">CodeScaffold</h1>
        <p className="subtitle">AI-Powered Full-Stack Project Generator</p>
      </div>

      <div className="wizard">
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-number">{step > 1 ? '✓' : '1'}</span>
            <span className="step-label">Describe</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span className="step-number">{step > 2 ? '✓' : '2'}</span>
            <span className="step-label">Configure</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Generate</span>
          </div>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      <div className="footer">
        <p>Built with ❤️ by CodeScaffold Team</p>
        <p style={{ marginTop: '0.5rem' }}>
          <a href="/cli" style={{ color: '#06b6d4', textDecoration: 'none' }}>
            Prefer CLI?
          </a>
        </p>
      </div>
    </div>
  );
}
