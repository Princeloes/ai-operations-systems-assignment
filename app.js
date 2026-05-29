// Core Application Controller

document.addEventListener('DOMContentLoaded', () => {
  
  // -------------------------------------------------------------
  // 1. Tab Navigation Routing
  // -------------------------------------------------------------
  const navButtons = document.querySelectorAll('.nav-btn');
  const panels = document.querySelectorAll('.tab-panel');
  const tabTitle = document.getElementById('current-tab-title');
  const tabSubtitle = document.getElementById('current-tab-subtitle');
  
  const tabMeta = {
    'workflow-studio': {
      title: 'Workflow Studio',
      subtitle: 'Redesigning grading & student feedback loops with AI automation'
    },
    'eduops-engine': {
      title: 'EduOps Engine',
      subtitle: 'Simulating the end-to-end Make.com automation pipeline'
    },
    'rollercoaster-lab': {
      title: 'Rollercoaster Lab',
      subtitle: 'Scaffolded physics investigation and energy simulator (Ages 11-14)'
    }
  };

  function switchTab(tabId) {
    // Update navigation button active states
    navButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update panel visibility
    panels.forEach(panel => {
      if (panel.id === `${tabId}-panel`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Update Header Text
    if (tabMeta[tabId]) {
      tabTitle.innerText = tabMeta[tabId].title;
      tabSubtitle.innerText = tabMeta[tabId].subtitle;
    }

    // Canvas adjustment on tab show
    if (tabId === 'rollercoaster-lab' && window.simulator) {
      setTimeout(() => {
        window.simulator.resizeCanvas();
      }, 50);
    }
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  // -------------------------------------------------------------
  // 2. Accordions (Scaffolded Lesson)
  // -------------------------------------------------------------
  const accordions = document.querySelectorAll('.accordion-item');
  accordions.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Close all others
      accordions.forEach(acc => acc.classList.remove('active'));
      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // -------------------------------------------------------------
  // 3. Interactive Quiz & Worksheet logic
  // -------------------------------------------------------------
  
  // Q1 Check
  const q1Buttons = document.querySelectorAll('#q1-container .quiz-opt');
  const q1Feedback = document.querySelector('#q1-container .quiz-feedback');
  q1Buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      q1Buttons.forEach(b => b.classList.remove('correct', 'incorrect'));
      const val = btn.getAttribute('data-val');
      if (val === 'b') {
        btn.classList.add('correct');
        q1Feedback.className = 'quiz-feedback success';
        q1Feedback.innerHTML = '<strong>Correct!</strong> At the top of the start hill, height $h$ is at its maximum, meaning Gravitational Potential Energy ($E_p = mgh$) is at its peak before conversion.';
      } else {
        btn.classList.add('incorrect');
        q1Feedback.className = 'quiz-feedback error';
        q1Feedback.innerHTML = '<strong>Not quite.</strong> Remember, Potential Energy depends directly on height ($E_p = mgh$). Look for the point with the highest vertical elevation.';
      }
    });
  });

  // Q2 Check & Hint
  const q2CheckBtn = document.getElementById('q2-check-btn');
  const q2HintBtn = document.getElementById('q2-hint-btn');
  const q2Input = document.getElementById('q2-input');
  const q2Feedback = document.querySelector('#q2-container .quiz-feedback');

  q2CheckBtn.addEventListener('click', () => {
    const val = parseFloat(q2Input.value);
    if (val === 11760) {
      q2Feedback.className = 'quiz-feedback success';
      q2Feedback.innerHTML = '<strong>Excellent calculation!</strong> Using the equation $E_p = m \cdot g \cdot h$: <br><br>$$E_p = 100\\text{ kg} \\cdot 9.8\\text{ m/s²} \\cdot 12\\text{ m} = 11,760\\text{ Joules}$$';
    } else if (val === 12000) {
      q2Feedback.className = 'quiz-feedback success';
      q2Feedback.innerHTML = '<strong>Good approximation!</strong> Using $g = 10\\text{ m/s²}$, you calculated $E_p = 100 \\cdot 10 \\cdot 12 = 12,000\\text{ Joules}$. In exams, try to use the exact gravity value $9.8\\text{ m/s²}$ unless told otherwise.';
    } else {
      q2Feedback.className = 'quiz-feedback error';
      q2Feedback.innerHTML = '<strong>Incorrect.</strong> Try recalculating using: Mass ($100\\text{ kg}$) $\\times$ Gravity ($9.8\\text{ m/s²}$) $\\times$ Height ($12\\text{ m}$).';
    }
  });

  q2HintBtn.addEventListener('click', () => {
    q2Feedback.className = 'quiz-feedback hint';
    q2Feedback.innerHTML = '<strong>Hint:</strong> Substitute values into the equation $E_p = m \\cdot g \\cdot h$. Here, $m = 100$, $g = 9.8$, and $h = 12$. Simply multiply these three numbers together!';
  });

  // Q3 Check
  const q3Buttons = document.querySelectorAll('#q3-container .quiz-opt');
  const q3Feedback = document.querySelector('#q3-container .quiz-feedback');
  q3Buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      q3Buttons.forEach(b => b.classList.remove('correct', 'incorrect'));
      const val = btn.getAttribute('data-val');
      if (val === 'c') {
        btn.classList.add('correct');
        q3Feedback.className = 'quiz-feedback success';
        q3Feedback.innerHTML = '<strong>Correct!</strong> When friction is high (converting mechanical energy into heat) and starting hill height is low (less initial mechanical energy), the cart loses too much total energy to reach the summit of the second hill (8.5m). Try simulating this in the panel!';
      } else {
        btn.classList.add('incorrect');
        q3Feedback.className = 'quiz-feedback error';
        q3Feedback.innerHTML = '<strong>Not quite.</strong> If friction is 0.00, energy conservation is perfect and the cart easily clears the second hill. Analyze which options subtract energy from the system.';
      }
    });
  });

  // Q4 Essay - Grade Trigger
  const gradeStudentBtn = document.getElementById('grade-student-btn');
  const q4Essay = document.getElementById('q4-essay');
  
  gradeStudentBtn.addEventListener('click', () => {
    const text = q4Essay.value.trim();
    if (!text) {
      alert("Please write a short analysis in the essay box first!");
      return;
    }
    
    // Switch to simulator tab, set rubric and input text, and run
    switchTab('eduops-engine');
    document.getElementById('rubric-select').value = 'physics-energy';
    document.getElementById('student-submission-select').value = 'custom';
    document.getElementById('essay-text-area').value = text;
    
    // Scroll and start
    setTimeout(() => {
      document.getElementById('run-pipeline-btn').click();
    }, 100);
  });

  // -------------------------------------------------------------
  // 4. Rollercoaster Physics Simulator Bindings
  // -------------------------------------------------------------
  const heightSlider = document.getElementById('height-slider');
  const frictionSlider = document.getElementById('friction-slider');
  const gravitySlider = document.getElementById('gravity-slider');
  
  const heightVal = document.getElementById('height-val');
  const frictionVal = document.getElementById('friction-val');
  const gravityVal = document.getElementById('gravity-val');
  
  const playBtn = document.getElementById('sim-play-btn');
  const pauseBtn = document.getElementById('sim-pause-btn');
  const resetBtn = document.getElementById('sim-reset-btn');
  const overlay = document.getElementById('canvas-overlay');
  
  // Instatiate Simulator globally
  window.simulator = new RollercoasterSimulator('sim-canvas');
  
  function updateSimParams() {
    heightVal.innerText = `${parseFloat(heightSlider.value).toFixed(1)} m`;
    frictionVal.innerText = `${parseFloat(frictionSlider.value).toFixed(2)}`;
    gravityVal.innerText = `${parseFloat(gravitySlider.value).toFixed(1)} m/s²`;
    
    window.simulator.updateParameters(
      heightSlider.value,
      frictionSlider.value,
      gravitySlider.value
    );
  }

  // Sliders input events
  heightSlider.addEventListener('input', updateSimParams);
  frictionSlider.addEventListener('input', updateSimParams);
  gravitySlider.addEventListener('input', updateSimParams);
  
  // Initialize values
  updateSimParams();

  // Button binds
  playBtn.addEventListener('click', () => {
    window.simulator.startSimulation();
    document.getElementById('sim-status-badge').innerText = 'RUNNING';
    document.getElementById('sim-status-badge').className = 'sim-badge running';
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    overlay.classList.add('hidden');
  });

  pauseBtn.addEventListener('click', () => {
    window.simulator.pauseSimulation();
    document.getElementById('sim-status-badge').innerText = 'PAUSED';
    document.getElementById('sim-status-badge').className = 'sim-badge';
    playBtn.disabled = false;
    pauseBtn.disabled = true;
  });

  resetBtn.addEventListener('click', () => {
    window.simulator.resetSimulation();
    document.getElementById('sim-status-badge').innerText = 'PAUSED';
    document.getElementById('sim-status-badge').className = 'sim-badge';
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    overlay.classList.remove('hidden');
  });

  // -------------------------------------------------------------
  // 5. AI Tool pipeline simulation (Task 2)
  // -------------------------------------------------------------
  const submissions = {
    'essay-a': {
      name: 'Leo Carter',
      email: 'parent.carter@eduopsmail.com',
      date: '2026-05-29',
      text: `Photosynthesis is how plants make food. They use sunlight, water from the ground, and carbon dioxide from the air. Chlorophyll is in the leaves and absorbs sunlight. This creates sugar for the plant to eat and oxygen for us to breathe. Plants use soil for energy because soil has dirt and vitamins. Plants grow in dark places too but they are yellow and skinny because there's no chlorophyll activation.`
    },
    'essay-b': {
      name: 'Maya Lin',
      email: 'parent.lin@eduopsmail.com',
      date: '2026-05-29',
      text: `Plants are beautiful and they breathe in carbon dioxide. In return, they give us oxygen. They do this by catching sunshine in their green leaves. It is like cooking in the kitchen but the ingredients are water, gas, and sunbeams. I love planting flowers in my garden.`
    },
    'custom': {
      name: 'Independent Student',
      email: 'parent.student@eduopsmail.com',
      date: '2026-05-29',
      text: `Select or write a custom student essay here to begin assessment.`
    }
  };

  const essaySelect = document.getElementById('student-submission-select');
  const essayTextArea = document.getElementById('essay-text-area');
  const rubricSelect = document.getElementById('rubric-select');
  const runPipelineBtn = document.getElementById('run-pipeline-btn');
  const logsContainer = document.getElementById('console-logs');
  const outputsContainer = document.getElementById('pipeline-outputs-container');
  
  // Populate text area on change
  essaySelect.addEventListener('change', () => {
    const selected = essaySelect.value;
    if (submissions[selected]) {
      essayTextArea.value = submissions[selected].text;
    }
  });

  // Set default
  essayTextArea.value = submissions['essay-a'].text;

  // Tab switching inside output cards
  const outputTabButtons = document.querySelectorAll('.output-tab-btn');
  const outputPanels = document.querySelectorAll('.output-panel');

  outputTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      outputTabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tabId = btn.getAttribute('data-output');
      outputPanels.forEach(panel => {
        if (panel.id === `${tabId}-tab`) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  // Generate grading evaluations (mock logic for demo realism)
  function evaluateSubmission(rubric, text, studentName) {
    const cleanText = text.toLowerCase();
    
    if (rubric === 'physics-energy') {
      // Default grades
      let criteria = [
        {
          name: 'Potential Energy Explanation',
          score: 3,
          desc: 'Explains Ep dependency on hill height and gravity.',
          feedback: 'Correctly identifies that Potential Energy is highest at the top of the coaster. Needs to explicitly state that Ep depends on height ($E_p=mgh$).'
        },
        {
          name: 'Kinetic Energy & Velocity',
          score: 3,
          desc: 'Describes Ek transformation and speed relation.',
          feedback: 'Correctly states that kinetic energy increases as speed increases down the hill. Could strengthen by referencing the formula $E_k=0.5mv^2$.'
        },
        {
          name: 'Friction & Thermal Exchange',
          score: 2,
          desc: 'Identifies friction energy loss to thermal heat.',
          feedback: 'Mentioned friction slows down the cart. Missed details about mechanical energy converting into thermal (heat) energy.'
        }
      ];

      // Scan for keywords to dynamically adjust scores (simulating AI agent!)
      const containsMgh = cleanText.includes('mgh') || cleanText.includes('height');
      const containsEkEquation = cleanText.includes('mv^2') || cleanText.includes('speed') || cleanText.includes('velocity');
      const containsThermal = cleanText.includes('thermal') || cleanText.includes('heat') || cleanText.includes('wheels hot');
      const containsConservation = cleanText.includes('conserv') || cleanText.includes('transform');

      if (containsMgh) {
        criteria[0].score = 5;
        criteria[0].feedback = 'Excellent explanation! You accurately explained Gravitational Potential Energy ($E_p = mgh$) and linked its peak to maximum elevation.';
      }
      if (containsEkEquation && cleanText.includes('kinetic')) {
        criteria[1].score = 5;
        criteria[1].feedback = 'Superb analysis. You clearly explained how Potential Energy transforms into Kinetic Energy ($E_k = 0.5mv^2$) as velocity increases during drops.';
      }
      if (containsThermal) {
        criteria[2].score = 4;
        criteria[2].feedback = 'Very good! You identified that friction transforms mechanical energy into thermal (heat) energy, causing the cart to lose kinetic velocity.';
      }
      if (containsThermal && cleanText.includes('total mechanical')) {
        criteria[2].score = 5;
        criteria[2].feedback = 'Masterful reasoning. You correctly noted that while friction turns energy into heat (thermal energy), the *Total Energy* of the system is still conserved.';
      }

      return criteria;
    } else {
      // Photosynthesis Rubric
      let criteria = [
        {
          name: 'Light Reactions & Chlorophyll',
          score: 3,
          desc: 'Understands chlorophyll sunlight absorption.',
          feedback: 'Correctly mentions chlorophyll absorbing sunlight in leaves. Missing description of split water molecules.'
        },
        {
          name: 'Dark Reactions & Carbon Cycle',
          score: 2,
          desc: 'Details CO2 fixation and glucose creation.',
          feedback: 'Vaguely mentions breathing carbon dioxide. Lacks explanation of carbon synthesis or glucose ($C_6H_{12}O_6$) construction.'
        },
        {
          name: 'Chemical Equation Precision',
          score: 2,
          desc: 'Includes balanced equation: H2O + CO2 + Light -> O2 + Glucose.',
          feedback: 'Lists standard ingredients (water, carbon dioxide, light). Did not write out the balanced chemical chemical formula.'
        }
      ];

      // Leo Carter custom matching
      if (cleanText.includes('dirt') || cleanText.includes('soil for energy')) {
        criteria[0].score = 4;
        criteria[1].score = 3;
        criteria[2].score = 4;
        criteria[1].feedback += ' NOTE: Has a misconception: stated plants use soil for *energy*. Explain that energy comes strictly from solar radiation; soil supplies anchoring and minerals.';
      }

      // High vocabulary check
      const containsEquation = cleanText.includes('6co2') || cleanText.includes('c6h12o6');
      const containsCalvin = cleanText.includes('calvin') || cleanText.includes('dark reaction');

      if (containsEquation) {
        criteria[2].score = 5;
        criteria[2].feedback = 'Excellent. You successfully utilized the balanced equation $6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2$ in your essay details.';
      }
      if (containsCalvin) {
        criteria[1].score = 5;
        criteria[1].feedback = 'Fantastic. Great inclusion of the Calvin Cycle (light-independent reactions) in synthesis description.';
      }
      
      return criteria;
    }
  }

  // Simulated run pipeline
  runPipelineBtn.addEventListener('click', () => {
    const text = essayTextArea.value.trim();
    if (!text) {
      alert("Submission content cannot be empty.");
      return;
    }

    const currentRubric = rubricSelect.value;
    const currentStudentSelect = essaySelect.value;
    
    let studentName = "Independent Student";
    let studentEmail = "parent.student@eduopsmail.com";
    
    if (submissions[currentStudentSelect]) {
      studentName = submissions[currentStudentSelect].name;
      studentEmail = submissions[currentStudentSelect].email;
    }
    
    if (currentStudentSelect === 'custom' && text.includes('kinetic energy')) {
      studentName = "Alex Rivera (Worksheet Submit)";
      studentEmail = "parent.rivera@eduopsmail.com";
    }

    // Reset UI states
    runPipelineBtn.disabled = true;
    outputsContainer.classList.add('disabled');
    logsContainer.innerHTML = '<div class="console-prompt">// Starting automated grading pipeline...</div>';
    
    const logs = [
      { time: 200, text: `[SYSTEM] Webhook triggered. Catching payload from form submission...`, type: 'info' },
      { time: 700, text: `[WEBHOOK] JSON Data parsed. Student: "${studentName}", Email: "${studentEmail}".`, type: 'text' },
      { time: 1300, text: `[AIRTABLE] Check existing records... No record found. Creating new Row record...`, type: 'text' },
      { time: 2000, text: `[AIRTABLE] Database Row logged. ID: rec_s${Math.floor(Math.random()*90000 + 10000)}. Status: "Awaiting AI Grading".`, type: 'success' },
      { time: 2700, text: `[AI_ORCHESTRATOR] Fetching grading parameters for Rubric ID: "${currentRubric}"...`, type: 'info' },
      { time: 3500, text: `[LLM_API] Sending prompt context to Claude-3.5-Sonnet endpoint (Temp: 0.1)...`, type: 'info' },
      { time: 4800, text: `[LLM_API] Parsing JSON response from model token stream...`, type: 'info' },
      { time: 5800, text: `[AI_ORCHESTRATOR] Scores calculated. Overall Rubric Match: ${currentRubric === 'physics-energy' ? 'Physics Standard MS-PS3' : 'Biology Standard MS-LS1'}.`, type: 'success' },
      { time: 6500, text: `[AIRTABLE] Updating record: Writing subscores, criteria feedback, and grading drafts.`, type: 'text' },
      { time: 7200, text: `[AIRTABLE] Airtable fields successfully synced. Status updated to "Ready for Review".`, type: 'success' },
      { time: 7900, text: `[EMAIL_SERVICE] Drafting customized parent report notification templates...`, type: 'text' },
      { time: 8500, text: `[EMAIL_SERVICE] Gmail API Draft saved. Draft ID: dft_${Math.floor(Math.random()*9000 + 1000)}.`, type: 'success' },
      { time: 9200, text: `[SYSTEM] Pipeline finished. Awaiting teacher verification approval.`, type: 'info' }
    ];

    // Play logs step by step
    logs.forEach(log => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.className = `log-entry ${
          log.type === 'info' ? 'log-info' : 
          log.type === 'success' ? 'log-success' : 
          log.type === 'warning' ? 'log-warning' : 'log-text'
        }`;
        
        const timestamp = new Date().toLocaleTimeString();
        div.innerHTML = `<span class="console-prompt">[${timestamp}]</span> ${log.text}`;
        logsContainer.appendChild(div);
        logsContainer.scrollTop = logsContainer.scrollHeight;
        
        // Final complete
        if (log.text.includes('Pipeline finished')) {
          completePipelineExecution(currentRubric, text, studentName, studentEmail);
        }
      }, log.time);
    });
  });

  function completePipelineExecution(rubricId, text, name, email) {
    runPipelineBtn.disabled = false;
    outputsContainer.classList.remove('disabled');
    
    // Switch to output scores tab by default
    document.querySelector('.output-tab-btn[data-output="rubric-scores"]').click();
    
    // Evaluate text
    const criteria = evaluateSubmission(rubricId, text, name);
    
    // Calculate total score
    let totalScore = 0;
    criteria.forEach(c => totalScore += c.score);
    
    // Overall Score Wheels count up animation
    const scoreVal = document.getElementById('overall-score-val');
    let counter = 0;
    const target = totalScore;
    const timer = setInterval(() => {
      if (counter >= target) {
        clearInterval(timer);
        scoreVal.innerText = target;
      } else {
        counter++;
        scoreVal.innerText = counter;
      }
    }, 40);

    // Meta details
    document.getElementById('result-student-name').innerText = name;
    document.getElementById('result-date').innerText = `Assessed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    
    // Render criteria items
    const criteriaContainer = document.getElementById('result-criteria-list');
    criteriaContainer.innerHTML = '';
    
    criteria.forEach(c => {
      const item = document.createElement('div');
      item.className = 'criteria-item';
      item.innerHTML = `
        <div class="criteria-header-row">
          <h6>${c.name}</h6>
          <span class="criteria-score-badge">${c.score} / 5</span>
        </div>
        <p><em>Requirement: ${c.desc}</em></p>
        <div class="criteria-critique">
          <strong>AI Formative Assessment Feedback:</strong>
          ${c.feedback}
        </div>
      `;
      criteriaContainer.appendChild(item);
    });

    // Populate Airtable DB table
    const airtableBody = document.getElementById('airtable-fields-tbody');
    const airtableData = [
      { field: 'Record ID', val: `<span class="db-pill">rec_${Math.floor(Math.random()*900000 + 100000)}</span>` },
      { field: 'Student Name', val: name },
      { field: 'Assignment Title', val: rubricId === 'physics-energy' ? 'Rollercoaster Energy Lab' : 'Photosynthesis processes' },
      { field: 'Subscore C1', val: `${criteria[0].score}/5` },
      { field: 'Subscore C2', val: `${criteria[1].score}/5` },
      { field: 'Subscore C3', val: `${criteria[2].score}/5` },
      { field: 'Total Score', val: `<strong>${totalScore}/15</strong>` },
      { field: 'Status', val: '<span class="badge badge-success">Ready for Review</span>' },
      { field: 'Gmail Draft Link', val: `<a href="#" style="color:var(--color-cyan)">View Draft</a>` }
    ];
    
    airtableBody.innerHTML = '';
    airtableData.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.field}</td>
        <td>${row.val}</td>
      `;
      airtableBody.appendChild(tr);
    });

    // Populate Gmail View
    document.getElementById('email-to-field').innerText = email;
    document.getElementById('email-subject-field').innerText = `Feedback: Science Assignment - ${name}`;
    
    // Construct email body with custom placeholders
    const criteriaStrengths = criteria.filter(c => c.score >= 4).map(c => c.name).join(', ');
    const criteriaWeaknesses = criteria.filter(c => c.score < 4).map(c => c.name).join(', ');
    
    let studyFocus = rubricId === 'physics-energy' ? 
      'review the Conservation of Energy and potential-to-kinetic transformations equations' : 
      'review the light-independent reactions (Calvin cycle) and check the chemical formulas';

    let emailText = `Dear Parent/Guardian,

I hope you are having a wonderful week. 

${name} recently completed their science written assignment. I have reviewed their submission, and wanted to share the formative feedback and scoring results:

• Overall Grade: ${totalScore}/15
${criteria[0].name}: ${criteria[0].score}/5
${criteria[1].name}: ${criteria[1].score}/5
${criteria[2].name}: ${criteria[2].score}/5

Feedback Highlights:
- Key Strengths: ${criteriaStrengths || 'Demonstrated dedicated effort across the assignment.'}
- Growth Area: ${criteriaWeaknesses ? `We will work on strengthening ${criteriaWeaknesses}.` : 'Demonstrates exceptional understanding of standard materials.'}

Recommendation:
I recommend ${name} ${studyFocus} to prepare for our upcoming chapter quiz next Tuesday. They can access the interactive rollercoaster simulation on the classroom hub at any time to reinforce these concepts.

If you have any questions about this feedback or their progress, please feel free to reach out.

Best regards,
Mr. Henderson
Science Department, Middle School Operations Hub`;

    document.getElementById('email-body-field').innerText = emailText;
  }
});
