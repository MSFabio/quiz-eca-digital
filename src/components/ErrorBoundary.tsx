import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-lg mx-auto my-12 p-6 bg-white rounded-2xl border border-red-200 shadow-xl text-center">
          <div className="w-12 h-12 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Instabilidade Momentânea</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Houve uma oscilação na exibição da tela. Seus dados e progresso estão salvos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={this.handleRetry}
              className="py-3 px-5 bg-[#004A2F] hover:bg-[#003823] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#C8A355]" />
              Continuar de onde parei
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
