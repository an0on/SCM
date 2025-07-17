import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout/Layout';
import { Contest, ContestCategory, Registration } from '../../types';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const ContestRegistration: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [contest, setContest] = useState<Contest | null>(null);
  const [categories, setCategories] = useState<ContestCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [paymentStep, setPaymentStep] = useState(false);
  const [existingRegistrations, setExistingRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    if (contestId) {
      fetchContestData();
      if (user) {
        fetchExistingRegistrations();
      }
    }
  }, [contestId, user]);

  const fetchContestData = async () => {
    try {
      const { data: contestData, error: contestError } = await supabase
        .from('contests')
        .select('*')
        .eq('id', contestId)
        .single();

      if (contestError) throw contestError;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('contest_categories')
        .select('*')
        .eq('contest_id', contestId);

      if (categoriesError) throw categoriesError;

      setContest(contestData);
      setCategories(categoriesData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingRegistrations = async () => {
    if (!user || !contestId) return;

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('contest_id', contestId);

      if (error) throw error;
      setExistingRegistrations(data || []);
    } catch (err: any) {
      console.error('Error fetching registrations:', err);
    }
  };

  const calculateTotalFee = () => {
    return selectedCategories.reduce((total, categoryId) => {
      const category = categories.find(c => c.id === categoryId);
      return total + (category?.entry_fee || 0);
    }, 0);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleProceedToPayment = () => {
    if (selectedCategories.length === 0) {
      setError('Please select at least one category');
      return;
    }
    setPaymentStep(true);
  };

  const handlePaymentSuccess = async (details: any) => {
    setRegistering(true);
    try {
      // Create registrations for each selected category
      for (const categoryId of selectedCategories) {
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          await supabase.from('registrations').insert({
            user_id: user!.id,
            contest_id: contestId,
            category_id: categoryId,
            payment_status: 'paid',
            payment_id: details.id,
            total_fee: category.entry_fee,
          });
        }
      }

      // Auto-create heats if threshold is reached
      for (const categoryId of selectedCategories) {
        await supabase.rpc('auto_create_heats', {
          p_contest_id: contestId,
          p_category_id: categoryId,
          p_phase: 'qualifier'
        });
      }

      navigate('/dashboard', { 
        state: { message: 'Registration successful! You are now registered for the contest.' }
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRegistering(false);
    }
  };

  const isAlreadyRegistered = (categoryId: string) => {
    return existingRegistrations.some(reg => 
      reg.category_id === categoryId && reg.payment_status === 'paid'
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded-apple"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-apple"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!contest) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Contest not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The contest you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Login Required</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to be logged in to register for contests.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 btn-primary"
          >
            Login
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/contests')}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Register for Contest</h1>
            <p className="mt-1 text-gray-600">{contest.title}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-apple">
            {error}
          </div>
        )}

        {/* Contest Info */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contest Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-700">Location</h3>
              <p className="text-gray-900">{contest.location}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Date</h3>
              <p className="text-gray-900">{new Date(contest.date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Format</h3>
              <p className="text-gray-900 capitalize">{contest.format}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Run Type</h3>
              <p className="text-gray-900 capitalize">
                {contest.run_type.replace('_', ' ')}
                {contest.run_type === 'jam' && ` (${contest.skaters_per_jam} skaters per jam)`}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Status</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                contest.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {contest.status === 'active' ? 'Registration Open' : 'Draft'}
              </span>
            </div>
          </div>
        </div>

        {!paymentStep ? (
          <>
            {/* Category Selection */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Categories</h2>
              <div className="space-y-4">
                {categories.map((category) => {
                  const alreadyRegistered = isAlreadyRegistered(category.id);
                  
                  return (
                    <div 
                      key={category.id}
                      className={`border rounded-apple p-4 transition-colors ${
                        alreadyRegistered 
                          ? 'border-green-200 bg-green-50'
                          : selectedCategories.includes(category.id)
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {alreadyRegistered ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category.id)}
                              onChange={() => handleCategoryToggle(category.id)}
                              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                            />
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                            {category.description && (
                              <p className="text-sm text-gray-600">{category.description}</p>
                            )}
                            {category.max_participants && (
                              <p className="text-xs text-gray-500">
                                Max {category.max_participants} participants
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            €{category.entry_fee.toFixed(2)}
                          </p>
                          {alreadyRegistered && (
                            <p className="text-xs text-green-600 font-medium">Registered</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total and Proceed */}
            {selectedCategories.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Total Fee</h3>
                    <p className="text-sm text-gray-600">
                      {selectedCategories.length} category{selectedCategories.length > 1 ? 'ies' : 'y'} selected
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      €{calculateTotalFee().toFixed(2)}
                    </p>
                    <button
                      onClick={handleProceedToPayment}
                      className="btn-primary mt-2"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Payment Step */
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment</h2>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
              <div className="space-y-2">
                {selectedCategories.map(categoryId => {
                  const category = categories.find(c => c.id === categoryId);
                  return category ? (
                    <div key={categoryId} className="flex justify-between text-sm">
                      <span>{category.name}</span>
                      <span>€{category.entry_fee.toFixed(2)}</span>
                    </div>
                  ) : null;
                })}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>€{calculateTotalFee().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <PayPalScriptProvider 
              options={{ 
                clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || 'test',
                currency: 'EUR',
                intent: 'capture'
              }}
            >
              <PayPalButtons
                style={{ layout: 'vertical' }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    intent: 'CAPTURE',
                    purchase_units: [{
                      amount: {
                        value: calculateTotalFee().toFixed(2),
                        currency_code: 'EUR'
                      },
                      description: `Contest Registration: ${contest.title}`
                    }]
                  });
                }}
                onApprove={async (data, actions) => {
                  if (actions.order) {
                    const details = await actions.order.capture();
                    await handlePaymentSuccess(details);
                  }
                }}
                onError={(err) => {
                  setError('Payment failed. Please try again.');
                  console.error('PayPal error:', err);
                }}
                disabled={registering}
              />
            </PayPalScriptProvider>

            <div className="mt-4 text-center">
              <button
                onClick={() => setPaymentStep(false)}
                className="btn-secondary"
                disabled={registering}
              >
                Back to Category Selection
              </button>
            </div>
          </div>
        )}

        {/* GDPR Notice */}
        <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-apple">
          <p className="font-medium mb-1">Data Protection Notice</p>
          <p>
            By registering for this contest, you agree to the processing of your personal data 
            in accordance with our privacy policy and GDPR regulations. Your data will only be 
            used for contest organization and communication purposes.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ContestRegistration;