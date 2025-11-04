import Layout from "./Layout.jsx";

import BusinessStarter from "./BusinessStarter";

import ConversationHistory from "./ConversationHistory";

import MyJourneys from "./MyJourneys";

import Profile from "./Profile";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    BusinessStarter: BusinessStarter,
    
    ConversationHistory: ConversationHistory,
    
    MyJourneys: MyJourneys,
    
    Profile: Profile,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<BusinessStarter />} />
                
                
                <Route path="/BusinessStarter" element={<BusinessStarter />} />
                
                <Route path="/ConversationHistory" element={<ConversationHistory />} />
                
                <Route path="/MyJourneys" element={<MyJourneys />} />
                
                <Route path="/Profile" element={<Profile />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <PagesContent />
    );
}