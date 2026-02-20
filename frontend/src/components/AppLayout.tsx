import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';

export default function AppLayout() {
    const { loadUser } = useAuthStore();

    useEffect(() => {
        loadUser();
    }, []);

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header />
                <Outlet />
            </div>
        </div>
    );
}
