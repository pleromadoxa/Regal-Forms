
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BuilderPage from './pages/BuilderPage';
import SignUpPage from './pages/SignUpPage';
import FormPreviewPage from './pages/FormPreviewPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TemplatesPage from './pages/TemplatesPage';
import IntegrationsPage from './pages/IntegrationsPage';
import FeaturesPage from './pages/FeaturesPage';
import SubmissionsPage from './pages/SubmissionsPage';
import FormSettingsPage from './pages/FormSettingsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import FormPublicPage from './pages/FormPublicPage';
import AdminDashboard from './pages/AdminDashboard';
import { CareersPage, ContactPage } from './pages/CompanyPages';
import { BlogPage, HelpCenterPage, ApiDocsPage } from './pages/ResourcePages';
import { PrivacyPage, TermsPage } from './pages/LegalPages';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <Layout>
                <LandingPage />
              </Layout>
            }
          />
          <Route
            path="/features"
            element={
              <Layout>
                <FeaturesPage />
              </Layout>
            }
          />
          
          {/* Company Pages */}
          <Route
            path="/careers"
            element={
              <Layout>
                <CareersPage />
              </Layout>
            }
          />
          <Route
            path="/contact"
            element={
              <Layout>
                <ContactPage />
              </Layout>
            }
          />

          {/* Resource Pages */}
          <Route
            path="/blog"
            element={
              <Layout>
                <BlogPage />
              </Layout>
            }
          />
          <Route
            path="/help"
            element={
              <Layout>
                <HelpCenterPage />
              </Layout>
            }
          />
          <Route
            path="/api-docs"
            element={
              <Layout>
                <ApiDocsPage />
              </Layout>
            }
          />

          {/* Legal Pages */}
          <Route
            path="/privacy"
            element={
              <Layout>
                <PrivacyPage />
              </Layout>
            }
          />
          <Route
            path="/terms"
            element={
              <Layout>
                <TermsPage />
              </Layout>
            }
          />

          {/* Auth Routes */}
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<SignUpPage isLogin={true} />} />
          
          {/* Public Form Preview & Live View */}
          <Route path="/preview" element={<FormPreviewPage />} />
          <Route path="/form/:slug" element={<FormPublicPage />} />

          {/* Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <BuilderPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <FormSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfileSettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/submissions"
            element={
              <ProtectedRoute>
                <Layout>
                  <SubmissionsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <AnalyticsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <Layout>
                  <TemplatesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/integrations"
            element={
              <ProtectedRoute>
                <Layout>
                  <IntegrationsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
