import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from '@/routes';
import './index.css';


export default function App() {
    return (
        <Router>
            <div className="App">
                <AppRoutes />
            </div>
        </Router>
    );
}
