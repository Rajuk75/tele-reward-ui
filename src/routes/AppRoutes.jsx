import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminRoute, { PublicRoute } from "../components/AdminRoute";
import PageLoader from "../components/PageLoader";
import ErrorBoundary from "../components/ErrorBoundary";

const lazyWithErrorHandling = (importFunc) => {
    return lazy(() =>
        importFunc().catch((error) => {
            console.error('Failed to load component:', error);
            return {
                default: () => (
                    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">Failed to load page</h2>
                            <p className="text-gray-400 mb-4">Please try refreshing the page.</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-yellow-500 text-black rounded-full font-bold hover:bg-yellow-400"
                            >
                                Reload
                            </button>
                        </div>
                    </div>
                )
            };
        })
    );
};

// ── Auth ─────────────────────────────────────────────────────────────────────
const Login               = lazyWithErrorHandling(() => import("../pages/Login"));

// ── Admin panel pages ─────────────────────────────────────────────────────────
const MainDashboard       = lazyWithErrorHandling(() => import("../pages/admin/dashboard/MainDashboard"));
const CampaignDetailsPage = lazyWithErrorHandling(() => import("../pages/admin/campaign/CampaignDetailsPage"));
const CampaignPage        = lazyWithErrorHandling(() => import("../pages/admin/campaign/CampaignPage"));

const OfferPage           = lazyWithErrorHandling(() => import("../pages/admin/offer/OfferPage"));
const OfferDetailsPage    = lazyWithErrorHandling(() => import("../pages/admin/offer/OfferDetailsPage"));

const ConversionPage      = lazyWithErrorHandling(() => import("../pages/admin/conversion/ConversionPage"));
const ReferralList        = lazyWithErrorHandling(() => import("../pages/admin/referral/ReferralList"));
const PostbackPage        = lazyWithErrorHandling(() => import("../pages/admin/postback/PostbackPage"));

const UserList            = lazyWithErrorHandling(() => import("../pages/admin/user/UserList"));

const AppRoutes = () => {
    return (
        <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Public Auth routes */}
                    <Route 
                        path="/" 
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        } 
                    />
                    <Route 
                        path="/login" 
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        } 
                    />

                    {/* ── Protected admin routes ── */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminLayout />
                            </AdminRoute>
                        }
                    >
                        <Route index                                   element={<MainDashboard />} />
                        <Route path="dashboard"                        element={<MainDashboard />} />
                        <Route path="campaigns"                        element={<CampaignPage />} />

                        <Route path="campaigns/:campaignId" element={<CampaignDetailsPage />} />
                        <Route path="offers"                           element={<OfferPage />} />
                        <Route path="offers/:offerId"                  element={<OfferDetailsPage />} />
                        <Route path="offers/:offerId/edit" element={<Navigate to=".." relative="path" replace />} />
                        <Route path="referrals"                        element={<ReferralList />} />

                        <Route path="conversions"                     element={<ConversionPage />} />
                        <Route path="postbacks"                       element={<PostbackPage />} />

                        <Route path="users"                           element={<UserList />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
};

export default AppRoutes;
