import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, User, Bot, MapPin, CheckCircle, Search, 
  ChevronRight, ChevronLeft, Map as MapIcon,
  Calendar, Info, BookOpen, AlertCircle, Award, Share2, PlayCircle, Video, Code
} from 'lucide-react';

// --- MOCK DATA ---
const upcomingElections = [
  { id: 1, name: "West Bengal Legislative Assembly", state: "West Bengal", pollingDate: "2026-04-15", status: "results_declared", daysLeft: 0, results: { winningParty: "BJP", seatsWon: 207, totalSeats: 294 } },
  { id: 2, name: "Tamil Nadu Legislative Assembly", state: "Tamil Nadu", pollingDate: "2026-04-23", status: "results_declared", daysLeft: 0, results: { winningParty: "TVK (Hung)", seatsWon: 108, totalSeats: 234 } },
  { id: 3, name: "Kerala Legislative Assembly", state: "Kerala", pollingDate: "2026-04-09", status: "results_declared", daysLeft: 0, results: { winningParty: "UDF (INC)", seatsWon: 102, totalSeats: 140 } },
  { id: 4, name: "Assam Legislative Assembly", state: "Assam", pollingDate: "2026-04-01", status: "results_declared", daysLeft: 0, results: { winningParty: "NDA (BJP)", seatsWon: 102, totalSeats: 126 } },
  { id: 5, name: "Puducherry Legislative Assembly", state: "Puducherry", pollingDate: "2026-04-09", status: "results_declared", daysLeft: 0, results: { winningParty: "NDA (AINRC)", seatsWon: 16, totalSeats: 30 } },
  { id: 6, name: "Bihar Legislative Assembly", state: "Bihar", pollingDate: "2026-10-15", status: "upcoming", daysLeft: 159 },
  { id: 7, name: "Delhi Municipal Corporation", state: "Delhi", pollingDate: "2026-07-20", status: "nominations_open", daysLeft: 72 },
  { id: 8, name: "Maharashtra By-Elections", state: "Maharashtra", pollingDate: "2026-06-01", status: "ongoing", daysLeft: 23 },
];

const timelineNodes = [
  { id: 1, label: "Voter Registration", date: "Jan - Mar 2026", status: "completed", details: "Electoral rolls are updated. New voters are added, and corrections are made." },
  { id: 2, label: "Nomination Filing", date: "Apr 2026", status: "completed", details: "Candidates file their nomination papers and affidavits to the Election Commission." },
  { id: 3, label: "Campaign Period", date: "May 2026", status: "active", details: "Candidates campaign. You will see rallies, manifestos, and public debates." },
  { id: 4, label: "Polling Day", date: "Jun 1, 2026", status: "upcoming", details: "Citizens go to the booths to cast their vote using EVMs." },
  { id: 5, label: "Counting Day", date: "Jun 4, 2026", status: "upcoming", details: "Votes are counted and results are officially declared by the ECI." }
];

const evmCards = [
  { id: 1, title: "The Control Unit", desc: "Kept with the Polling Officer. It controls the ballot unit and ensures only one vote is cast per person.", icon: "🎛️" },
  { id: 2, title: "The Ballot Unit", desc: "This is where you vote! Press the blue button next to your chosen candidate's name and symbol.", icon: "🗳️" },
  { id: 3, title: "VVPAT Machine", desc: "Voter Verifiable Paper Audit Trail. It prints a slip showing your vote for 7 seconds so you can verify it.", icon: "🧾" },
  { id: 4, title: "Sealing & Security", desc: "After voting ends, machines are sealed in front of political party agents and taken to strong rooms.", icon: "🔒" }
];

// --- MOCK API ---
const mockClaudeResponse = async (prompt) => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  const lower = prompt.toLowerCase();
  
  // Quiz Flow
  if (lower.includes('eligible') || lower.includes('quiz')) {
    return `Let's find out if you're ready to vote! 🧐\n\n**Question 1:** Are you an Indian citizen who will be 18 years or older on the qualifying date?\n\nReply **Yes** or **No**!`;
  }
  if (lower === 'yes' || lower === 'yes!') {
    return `Great! 🎉\n\n**Question 2:** Is your name already enrolled in the electoral roll (voter list) of your current constituency?\n\nReply **Enrolled** or **Not Enrolled**!`;
  }
  if (lower === 'no' || lower === 'no!') {
    return `Ah, I see! You must be 18+ and an Indian citizen to vote. If you're turning 18 soon, you can apply in advance! Let me know if you want to know how to register.\n\n{"action": "show_voter_journey"}`;
  }
  if (lower.includes('enrolled')) {
    if (lower.includes('not')) {
      return `No worries! You just need to fill **Form 6** on the NVSP portal to get your name added.\n\nHere's the voter journey to guide you through it! 👇\n\n{"action": "show_voter_journey"}`;
    } else {
      return `Awesome! 🌟 You are fully eligible and ready to vote. Make sure you find your polling booth before election day!\n\n{"action": "show_booth_finder"}`;
    }
  }

  // Regular intents
  if (lower.includes('register') || lower.includes('voter journey')) {
    return `Registering to vote is easy! You can do it online via the National Voters' Service Portal (NVSP). Here are the simple steps:\n\n• Visit the NVSP portal and select Form 6 for new registration.\n• Fill in your details like name, age, and address.\n• Upload required documents (Age & Address proof).\n• Submit and track your application status.\n\nOnce verified, your Voter ID will be mailed to you! 📩\n\n{"action": "show_voter_journey"}`;
  }
  if (lower.includes('find') || lower.includes('booth') || lower.includes('polling')) {
    return `You can easily find your polling booth using your Voter ID (EPIC number) or by searching your details on the Election Commission portal. 📍\n\nI can bring up a tool to help you locate the nearest one right now!\n\n{"action": "show_booth_finder"}`;
  }
  if (lower.includes('evm') || lower.includes('vvpat')) {
    return `Electronic Voting Machines (EVMs) make voting quick and secure! 🗳️\n\n• The ballot unit has candidate names and symbols.\n• You press the blue button next to your choice.\n• A beep sounds, and the VVPAT machine prints a slip for 7 seconds so you can verify your vote before it drops into the sealed box.\n\nLet me show you a quick explainer on how it works!\n\n{"action": "show_evm_explainer"}`;
  }
  if (lower.includes('upcoming') || lower.includes('dashboard')) {
    return `There are several important elections coming up! 📅 From state assemblies to local municipal polls, it's a busy year for democracy. Check out the dashboard to see what's happening near you.\n\n{"action": "show_elections_dashboard"}`;
  }
  if (lower.includes('timeline') || lower.includes('process')) {
    return `The election process is a massive democratic exercise that happens in clear phases:\n\n1. Voter Registration\n2. Nominations\n3. Campaigning\n4. Polling Day\n5. Counting & Results\n\nI've opened the timeline view so you can see exactly where we are in the current cycle! 🗓️\n\n{"action": "show_timeline"}`;
  }
  if (lower.includes('data') || lower.includes('dataset') || lower.includes('github') || lower.includes('developer') || lower.includes('api')) {
    return `If you're looking for election data, there are some excellent open-source resources available! 📊\n\nI can show you the top repositories for India Election Data, including DataMeet, India Votes Data, and in-rolls.\n\n{"action": "show_data_sources"}`;
  }
  if (lower.includes('document')) {
    return `To vote, you MUST carry your **Voter ID card (EPIC)**. 🆔\n\nIf you don't have it, you can bring one of these approved photo IDs:\n• Aadhaar Card\n• PAN Card\n• Driving License\n• Indian Passport\n• MGNREGA Job Card\n\nMake sure the ID is original, not a photocopy!`;
  }
  

  return `That's a great question about our civic process! While I'm still learning, I'm happy to help you find your polling booth, explain EVMs, or show you upcoming elections. What would you like to explore? 🏛️`;
};


// --- COMPONENTS ---

const ChatMessage = ({ msg, onActionClick }) => {
  const isAI = msg.role === 'ai';
  
  // Extract action tag if present
  let content = msg.content;
  let actionMatch = content.match(/{"action":\s*"([^"]+)"}/);
  let action = null;
  
  if (actionMatch) {
    action = actionMatch[1];
    content = content.replace(actionMatch[0], '').trim();
  }

  // Formatting bullet points and bold text
  const formattedContent = content.split('\n').map((line, i) => {
    if (line.startsWith('•')) {
      return <li key={i}>{line.substring(1).trim()}</li>;
    }
    // simple bolding
    const bolded = line.split(/(\*\*.*?\*\*)/).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    return line ? <p key={i}>{bolded}</p> : <br key={i}/>;
  });

  return (
    <div className={`message ${isAI ? 'ai' : 'user'}`}>
      <div className="message-avatar">
        {isAI ? <Bot size={20} /> : <User size={20} />}
      </div>
      <div className="message-content" style={{ flex: 1 }}>
        <div className="message-bubble">
          {formattedContent}
        </div>
        {isAI && action && (
          <div className="inline-action-card">
            <span>View detailed graphic</span>
            <button className="inline-action-btn" onClick={() => onActionClick(action)}>
              Open View →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardModule = () => {
  const handleShare = () => {
    navigator.clipboard.writeText("Check out the upcoming elections on the Election Guide Assistant!");
    alert("Info copied to clipboard! Share it with your friends.");
  };

  return (
    <div className="module-container">
      <div className="module-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <div style={{ textAlign: 'left' }}>
          <h2 className="module-title">Upcoming Elections</h2>
          <p className="module-subtitle">Stay informed about democratic events in your region</p>
        </div>
        <button className="inline-action-btn" onClick={handleShare} style={{ background: 'var(--hover-bg)', color: 'var(--primary-blue)', border: '1px solid var(--border-color)' }}>
          <Share2 size={16} style={{marginRight: '0.4rem', verticalAlign: 'middle'}} /> Share
        </button>
      </div>
      <div className="dashboard-grid">
        {upcomingElections.map(election => (
          <div key={election.id} className="election-card">
            <div className="election-card-top">
              <span className={`status-tag ${election.status}`}>
                {election.status.replace('_', ' ')}
              </span>
              {election.daysLeft > 0 && (
                <div className="countdown-badge">
                  <Calendar size={14} />
                  {election.daysLeft} days left
                </div>
              )}
            </div>
            <h3>{election.name}</h3>
            <div className="election-info">
              <div className="info-row">
                <MapPin size={16} /> {election.state}
              </div>
              <div className="info-row">
                <Calendar size={16} /> Polling: {new Date(election.pollingDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </div>
              {election.status === 'results_declared' && election.results && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--hover-bg)', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Winning Party:</span>
                    <strong style={{ color: 'var(--primary-blue)' }}>{election.results.winningParty}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Seats Won:</span>
                    <strong>{election.results.seatsWon} / {election.results.totalSeats}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimelineModule = () => {
  const [activeNode, setActiveNode] = useState(3); // Campaign Period
  
  return (
    <div className="module-container">
      <div className="module-header">
        <h2 className="module-title">Election Timeline</h2>
        <p className="module-subtitle">Track the democratic process from start to finish</p>
      </div>
      <div className="timeline-container">
        <div className="timeline-line"></div>
        <div className="timeline-line-fill" style={{ width: '50%' }}></div>
        <div className="timeline-nodes">
          {timelineNodes.map(node => (
            <div 
              key={node.id} 
              className={`timeline-node ${node.status} ${activeNode === node.id ? 'active' : ''}`}
              onClick={() => setActiveNode(node.id)}
            >
              <div className="node-icon">
                {node.status === 'completed' ? <CheckCircle size={24} /> : node.id}
              </div>
              <div className="node-label">{node.label}</div>
              <div className="node-date">{node.date}</div>
            </div>
          ))}
        </div>
      </div>
      
      {activeNode && (
        <div className="timeline-details">
          <h4>{timelineNodes.find(n => n.id === activeNode).label}</h4>
          <p>{timelineNodes.find(n => n.id === activeNode).details}</p>
        </div>
      )}
    </div>
  );
};

const BoothFinderModule = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setLoading(false);
      setResult({
        name: "Government High School, Ward " + (Math.floor(Math.random() * 50) + 1),
        address: "12, Main Road, City Center. PIN: " + (query.length >= 6 ? query.substring(0, 6) : "400001"),
        distance: (Math.random() * 5 + 0.5).toFixed(1) + " km",
      });
    }, 1000);
  };

  return (
    <div className="module-container booth-finder-container">
      <div className="module-header" style={{ marginBottom: '1rem' }}>
        <h2 className="module-title">Find Polling Booth</h2>
        <p className="module-subtitle">Locate where you need to go to cast your vote</p>
      </div>
      <div className="search-box">
        <div className="search-input-wrapper">
          <Search size={20} color="#666" />
          <input 
            type="text" 
            placeholder="Enter your Voter ID (EPIC) or Pincode..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button className="search-btn" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      <div className="map-placeholder">
        {loading ? (
          <div className="typing-indicator" style={{ display: 'flex', gap: '0.3rem', padding: '0.5rem 0' }}>
            <div className="dot"></div><div className="dot"></div><div className="dot"></div>
          </div>
        ) : result ? (
          <>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15082.90956285215!2d72.82570881657805!3d19.075485422879512!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9b0e271465d%3A0xc3f1a0e1925b156a!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
              width="100%" height="100%" style={{ border: 0, position: 'absolute', top: 0, left: 0, opacity: 0.6 }} 
              allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade">
            </iframe>
            <div className="map-overlay" style={{ position: 'absolute', zIndex: 2 }}>
              <h4 style={{ color: '#1A3A6B', marginBottom: '0.5rem' }}>{result.name}</h4>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                {result.address} <br/> 
                <strong>Distance:</strong> {result.distance}
              </p>
              <button className="inline-action-btn" style={{ width: '100%' }}>Get Directions</button>
            </div>
          </>
        ) : (
          <>
            <MapIcon size={48} color="#999" style={{ marginBottom: '1rem' }} />
            <p>Enter your details above to find your booth.</p>
          </>
        )}
      </div>
    </div>
  );
};

const VoterJourneyModule = ({ onAskChat }) => {
  const [activeStep, setActiveStep] = useState(null);

  const steps = [
    { num: 1, title: "Check Eligibility", desc: "You must be 18+ years old and an Indian citizen.", extra: "You can quickly check your name on the NVSP website using your basic details.", example: "Example Case: Rahul turns 18 on Jan 1st of the election year. Since he is an Indian citizen, he is eligible to register immediately." },
    { num: 2, title: "Register on NVSP", desc: "Fill Form 6 online or via the Voter Helpline app.", extra: "Form 6 is specifically for new voters. Keep your Aadhaar and age proof handy.", example: "Example Case: Priya moves to a new city. She needs to fill Form 8 to shift her constituency rather than Form 6." },
    { num: 3, title: "Verify Voter ID", desc: "Ensure your name appears on the final electoral roll.", extra: "Once your application is approved, your EPIC number is generated.", example: "Example Case: Anil checks his name online using his EPIC number 2 weeks before polling to ensure his name wasn't accidentally deleted." },
    { num: 4, title: "Find Polling Booth", desc: "Know your booth address before election day.", extra: "You can find this using the Booth Finder module or SMS services.", example: "Example Case: Sunita uses her Pincode in the Booth Finder app and finds her booth is at the local Govt School, just 1km away." },
    { num: 5, title: "Carry Documents", desc: "Bring your original Voter ID or approved alternative ID.", extra: "Photocopies are not allowed. Always carry the original document.", example: "Example Case: Amit lost his Voter ID. He brings his original Aadhaar card and PAN card to the booth as valid alternatives." },
    { num: 6, title: "Cast Vote", desc: "Press the button on the EVM and check the VVPAT slip.", extra: "You'll hear a long beep indicating your vote is registered successfully.", example: "Example Case: Deepa presses the blue button for her candidate. She looks at the VVPAT glass and sees her candidate's symbol printed for 7 seconds." }
  ];

  return (
    <div className="module-container">
      <div className="module-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'}}>
        <div style={{ textAlign: 'left' }}>
          <h2 className="module-title">The Voter Journey</h2>
          <p className="module-subtitle">Step-by-step guide to exercising your right</p>
        </div>
        <button className="inline-action-btn" onClick={() => onAskChat("Am I eligible to vote?")}>
          <Award size={16} style={{marginRight: '0.4rem', verticalAlign: 'middle'}} /> Take Eligibility Quiz
        </button>
      </div>
      <div className="stepper-container">
        {steps.map(step => {
          const isActive = activeStep === step.num;
          return (
            <div 
              key={step.num} 
              className={`step-item ${isActive ? 'active-step' : ''}`}
              onClick={() => setActiveStep(isActive ? null : step.num)}
              style={{ cursor: 'pointer', flexDirection: 'column', gap: '0.5rem', borderColor: isActive ? 'var(--primary-blue)' : '' }}
            >
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div className="step-number" style={{ background: isActive ? 'var(--primary-orange)' : '', color: isActive ? 'white' : '' }}>
                  {step.num}
                </div>
                <div className="step-content">
                  <h4 style={{ color: isActive ? 'var(--primary-blue)' : '' }}>{step.title}</h4>
                  <p style={{ marginBottom: 0 }}>{step.desc}</p>
                </div>
                <div style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
                  {isActive ? <ChevronLeft size={20} style={{transform: 'rotate(90deg)'}}/> : <ChevronRight size={20}/>}
                </div>
              </div>
              
              {isActive && (
                <div style={{ marginLeft: 'calc(40px + 1.5rem)', marginTop: '0.5rem', animation: 'fadeIn 0.3s' }}>
                  <p style={{ color: '#444', marginBottom: '0.75rem', background: 'var(--hover-bg)', padding: '0.75rem', borderRadius: '8px' }}>
                    {step.extra}
                  </p>
                  <p style={{ color: 'var(--primary-blue)', marginBottom: '1rem', background: '#e3f2fd', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    <strong>{step.example.split(':')[0]}:</strong> {step.example.split(':')[1]}
                  </p>
                  <button 
                    className="learn-more-chip"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAskChat(`Tell me more about: ${step.title}`);
                    }}
                  >
                    <Info size={14} /> Ask Assistant
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EVMExplainerModule = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  
  const next = () => setCurrentIdx(prev => Math.min(prev + 1, evmCards.length - 1));
  const prev = () => setCurrentIdx(prev => Math.max(prev - 1, 0));

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="module-header">
        <h2 className="module-title">How EVM Works</h2>
        <p className="module-subtitle">Understanding the technology behind your vote</p>
      </div>
      <div className="evm-deck">
        <div className="evm-card">
          <div className="evm-card-icon">{evmCards[currentIdx].icon}</div>
          <h3>{evmCards[currentIdx].title}</h3>
          <p>{evmCards[currentIdx].desc}</p>
        </div>
        
        <div className="evm-controls">
          <button className="evm-btn" onClick={prev} disabled={currentIdx === 0}>
            <ChevronLeft size={24} />
          </button>
          <div className="evm-progress">
            {evmCards.map((_, i) => (
              <div key={i} className={`progress-dot ${i === currentIdx ? 'active' : ''}`} />
            ))}
          </div>
          <button className="evm-btn" onClick={next} disabled={currentIdx === evmCards.length - 1}>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

const VideoTutorialsModule = () => (
  <div className="module-container">
    <div className="module-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
      <div style={{ textAlign: 'left' }}>
        <h2 className="module-title">Video Tutorials</h2>
        <p className="module-subtitle">Learn through step-by-step visual guides</p>
      </div>
    </div>
    <div className="video-grid" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      <div className="video-card" style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <div className="video-placeholder" style={{ height: '200px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/MF2y8Jcp9bM" 
            title="Video Tutorial 1" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen>
          </iframe>
        </div>
        <h4 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>EVM & VVPAT Guide</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Learn how the voting machine works securely.</p>
      </div>
      <div className="video-card" style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <div className="video-placeholder" style={{ height: '200px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/BtsyBetcCCs" 
            title="Video Tutorial 2" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen>
          </iframe>
        </div>
        <h4 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>Election Process</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Detailed breakdown of polling day steps.</p>
      </div>
      <div className="video-card" style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <div className="video-placeholder" style={{ height: '200px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/ZJReQ8ao0SU" 
            title="Video Tutorial 3" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen>
          </iframe>
        </div>
        <h4 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>Voter Registration</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>How to ensure you are ready to cast your vote.</p>
      </div>
    </div>
  </div>
);



const DataSourcesModule = () => {
  const sources = [
    {
      id: 1,
      title: "DataMeet India Election Data",
      description: "One of the best open datasets for India elections, structured and easy to use with Python, Node.js, or SQL.",
      includes: ["Lok Sabha & Assembly data", "Constituencies", "MPs and MLAs", "Affidavits", "Village-to-constituency mapping"],
      bestFor: "Election dashboards, Analytics projects, ML models, Civic-tech apps",
      icon: "📊",
      link: "https://github.com/datameet/india-election-data"
    },
    {
      id: 2,
      title: "India Votes Data",
      description: "Best for automatically fetching the latest official ECI results. Includes Python scrapers ready to run.",
      includes: ["Scrapes official ECI results", "Exports CSV + JSON", "Constituency-wise vote counts", "Candidate details"],
      bestFor: "Real-time election apps, Live dashboards, AI election assistants",
      icon: "⚡",
      link: "https://github.com/search?q=india+votes+data+scraper"
    },
    {
      id: 3,
      title: "in-rolls Election Data Project",
      description: "Excellent for mapping and demographics. Contains tools for converting electoral PDFs to CSV.",
      includes: ["Polling station data", "Electoral rolls", "Constituency shapefiles", "GIS maps", "Voter demographics"],
      bestFor: "Election center finder, Booth locator, Interactive maps, Geospatial analytics",
      icon: "🗺️",
      link: "https://github.com/in-rolls"
    }
  ];

  return (
    <div className="module-container">
      <div className="module-header" style={{ marginBottom: '1.5rem' }}>
        <h2 className="module-title">Open Election Data</h2>
        <p className="module-subtitle">Explore top repositories and datasets for India elections</p>
      </div>
      <div className="data-sources-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sources.map(source => (
          <div key={source.id} className="data-source-card" style={{ background: 'var(--white)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '2rem' }}>{source.icon}</div>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h3 style={{ color: 'var(--primary-blue)', marginBottom: '0.25rem' }}>{source.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{source.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Code size={14} /> Includes
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {source.includes.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle size={14} /> Good For
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{source.bestFor}</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button 
                className="inline-action-btn" 
                style={{ whiteSpace: 'nowrap' }}
                onClick={() => window.open(source.link, '_blank')}
              >
                View GitHub <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Namaste! 🙏 I'm your Election Guide Assistant. I can help you understand the voting process, find your polling booth, or learn about upcoming elections. How can I help you today?" }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentModule, setCurrentModule] = useState('show_elections_dashboard');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInputVal('');
    setIsTyping(true);

    try {
      // Fetch AI response
      const response = await mockClaudeResponse(text);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
      
      // Check for action tag to switch modules automatically
      const actionMatch = response.match(/{"action":\s*"([^"]+)"}/);
      if (actionMatch) {
        setCurrentModule(actionMatch[1]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "I couldn't connect right now. Try one of the quick topics above! 🔌" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (prompt, action) => {
    handleSend(prompt);
  };

  const quickChips = [
    { label: "📋 Register to Vote", prompt: "How do I register to vote in India?" },
    { label: "📍 Find My Booth", prompt: "How do I find my polling booth?" },
    { label: "⚡ How EVM Works", prompt: "How does EVM and VVPAT voting work?" },
    { label: "📅 Upcoming Elections", prompt: "What elections are coming up soon?" },
    { label: "📊 Open Data", prompt: "What are the best open datasets for India elections?" },
    { label: "🗓️ Election Timeline", prompt: "Show me the full election process timeline" },
    { label: "📄 Documents Needed", prompt: "What documents do I need to vote?" }
  ];

  const renderModule = () => {
    switch (currentModule) {
      case 'show_timeline': return <TimelineModule />;
      case 'show_booth_finder': return <BoothFinderModule />;
      case 'show_voter_journey': return <VoterJourneyModule onAskChat={handleSend} />;
      case 'show_evm_explainer': return <EVMExplainerModule />;
      case 'show_video_tutorials': return <VideoTutorialsModule />;
      case 'show_data_sources': return <DataSourcesModule />;
      case 'show_elections_dashboard':
      default:
        return <DashboardModule />;
    }
  };

  const getBreadcrumbLabel = () => {
    switch (currentModule) {
      case 'show_timeline': return "Election Timeline";
      case 'show_booth_finder': return "Polling Booth Finder";
      case 'show_voter_journey': return "Voter Journey Steps";
      case 'show_evm_explainer': return "EVM Explainer";
      case 'show_video_tutorials': return "Video Tutorials";
      case 'show_data_sources': return "Open Election Data";
      case 'show_elections_dashboard': return "Elections Dashboard";
      default: return "Dashboard";
    }
  };

  return (
    <div className="app-container">
      {/* Top Bar */}
      <header className="top-bar">
        <div className="logo">
          🗳️ Election Guide Assistant
        </div>
        <div className="lang-switcher">
          <button className="lang-btn active">EN</button>
          <button className="lang-btn">हिं</button>
          <button className="lang-btn">मर</button>
        </div>
      </header>

      <main className="main-content">
        {/* Chat Panel */}
        <div className="chat-panel">
          <div className="chat-history">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} msg={msg} onActionClick={setCurrentModule} />
            ))}
            {isTyping && (
              <div className="message ai">
                <div className="message-avatar"><Bot size={20} /></div>
                <div className="message-bubble" style={{ padding: '0.8rem 1rem' }}>
                  <div className="typing-indicator">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-area">
            <div className="quick-chips">
              {quickChips.map((chip, idx) => (
                <button 
                  key={idx} 
                  className="chip"
                  onClick={() => handleQuickAction(chip.prompt)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
            <div className="input-wrapper">
              <input 
                type="text" 
                placeholder="Type a question..." 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend(inputVal)}
              />
              <button 
                className="send-btn" 
                onClick={() => handleSend(inputVal)}
                disabled={!inputVal.trim() || isTyping}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Panel */}
        <div className="visual-panel">
          <div className="breadcrumb">
            <BookOpen size={16} /> Exploring: <strong>{getBreadcrumbLabel()}</strong>
          </div>
          
          {/* Navigation Tabs */}
          <div className="nav-tabs">
            <button className={`nav-tab ${currentModule === 'show_elections_dashboard' ? 'active' : ''}`} onClick={() => setCurrentModule('show_elections_dashboard')}>
              <Calendar size={14} /> Dashboard
            </button>
            <button className={`nav-tab ${currentModule === 'show_timeline' ? 'active' : ''}`} onClick={() => setCurrentModule('show_timeline')}>
              <Calendar size={14} /> Timeline
            </button>
            <button className={`nav-tab ${currentModule === 'show_voter_journey' ? 'active' : ''}`} onClick={() => setCurrentModule('show_voter_journey')}>
              <CheckCircle size={14} /> Journey
            </button>
            <button className={`nav-tab ${currentModule === 'show_evm_explainer' ? 'active' : ''}`} onClick={() => setCurrentModule('show_evm_explainer')}>
              <Info size={14} /> EVM Explainer
            </button>
            <button className={`nav-tab ${currentModule === 'show_booth_finder' ? 'active' : ''}`} onClick={() => setCurrentModule('show_booth_finder')}>
              <MapPin size={14} /> Booth Finder
            </button>
            <button className={`nav-tab ${currentModule === 'show_video_tutorials' ? 'active' : ''}`} onClick={() => setCurrentModule('show_video_tutorials')}>
              <Video size={14} /> Video Tutorials
            </button>
            <button className={`nav-tab ${currentModule === 'show_data_sources' ? 'active' : ''}`} onClick={() => setCurrentModule('show_data_sources')}>
              <Code size={14} /> Open Data
            </button>
          </div>

          <div key={currentModule} className="animated-module">
            {renderModule()}
          </div>
        </div>
      </main>
    </div>
  );
}
