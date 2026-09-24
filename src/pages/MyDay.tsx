
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function MyDay() {
  const { leads, setSelectedLeadId } = useApp();
  const navigate = useNavigate();

  const handleViewLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    navigate('/profile');
  };

  const today = new Date().toISOString().substring(0, 10);
  const past3Days = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

  // Filter buckets
  const hotLeads = leads.filter(l => l.temperature === 'Hot' && l.crmStage !== 'Converted' && l.crmStage !== 'Lost' && l.crmStage !== 'Unqualified' && l.crmStage !== 'Not Interested');
  
  const paymentPending = leads.filter(l => l.crmStage === 'Payment Pending' || l.crmStage === 'Payment Discussion');
  
  const newLeads = leads.filter(l => l.crmStage === 'New Lead');
  
  const overdueFollowUps = leads.filter(l => {
    const next = l.nextFollowUp ? l.nextFollowUp.substring(0, 10) : '';
    return next && next < today && !['Converted', 'Lost', 'Unqualified'].includes(l.crmStage);
  });

  const dueToday = leads.filter(l => {
    const next = l.nextFollowUp ? l.nextFollowUp.substring(0, 10) : '';
    return next === today && !['Converted', 'Lost', 'Unqualified'].includes(l.crmStage);
  });

  const losingMomentum = leads.filter(l => {
    const last = l.lastContacted ? l.lastContacted.substring(0, 10) : '';
    return (l.temperature === 'Hot' || l.priority === 'P1' || l.priority === 'P0') 
        && (!last || last < past3Days) 
        && !['Converted', 'Lost', 'Unqualified', 'Not Interested'].includes(l.crmStage);
  });

  const Section = ({ title, data, icon, colorClass }: { title: string, data: any[], icon: string, colorClass: string }) => {
    if (data.length === 0) return null;
    
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h2 className={`text-lg font-bold flex items-center gap-2 ${colorClass}`}>
          <span>{icon}</span> {title} ({data.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(l => (
            <div key={l.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 onClick={() => handleViewLead(l.id)} className="font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary-600">
                    {l.fullName}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300">
                    {l.crmStage}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <p><strong>Goal:</strong> {l.primaryGoal}</p>
                  <p className="text-primary-600 dark:text-primary-400"><strong>AI Action:</strong> {l.nextBestAction || l.recommendedNextAction || 'Call immediately'}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-auto">
                <a href={`https://wa.me/${l.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center rounded">
                  WhatsApp
                </a>
                <a href={`tel:${l.phone.replace(/[^0-9]/g, '')}`} className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs text-center rounded">
                  Call
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>☀️</span> My Day
        </h1>
        <p className="text-sm text-gray-500 mt-1">Your AI-curated sales workspace. Execute your top priorities without leaving this screen.</p>
      </div>

      <Section title="Payment Pending" data={paymentPending} icon="💳" colorClass="text-orange-600 dark:text-orange-400" />
      <Section title="Overdue Follow-Ups" data={overdueFollowUps} icon="🚨" colorClass="text-red-600 dark:text-red-400" />
      <Section title="Follow-Ups Due Today" data={dueToday} icon="📅" colorClass="text-blue-600 dark:text-blue-400" />
      <Section title="Hot Leads" data={hotLeads} icon="🔥" colorClass="text-rose-600 dark:text-rose-400" />
      <Section title="Losing Momentum" data={losingMomentum} icon="⚠️" colorClass="text-amber-600 dark:text-amber-400" />
      <Section title="New Leads" data={newLeads} icon="🌟" colorClass="text-emerald-600 dark:text-emerald-400" />
      
      {hotLeads.length === 0 && paymentPending.length === 0 && overdueFollowUps.length === 0 && dueToday.length === 0 && losingMomentum.length === 0 && newLeads.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500">
          <span className="text-4xl mb-4 block">🎉</span>
          Inbox Zero! You've cleared all high-priority tasks for today.
        </div>
      )}
    </div>
  );
}
