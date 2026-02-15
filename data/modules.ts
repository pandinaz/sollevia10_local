
/**
 * ==========================================
 * CONTENT MANAGEMENT INSTRUCTIONS
 * ==========================================
 * 
 * 1. EDITING TEXT:
 *    - Edit the text inside the backticks (` `).
 *    - Line breaks and paragraphs are preserved automatically.
 * 
 * 2. ADDING AUDIO FILES:
 *    - BEST PRACTICE: Create a folder named 'assets' inside the 'public' folder.
 *    - Add files there (e.g., 'motion-audio.mp3').
 *    - Reference: audioUrl: '/assets/motion-audio.mp3'
 *    - OR use a Google Drive streaming link (see example below).
 * 
 * 3. ADDING VIDEO FILES:
 *    - OPTION A (YouTube): Use the watch URL. Easiest method.
 *      Example: videoUrl: 'https://www.youtube.com/watch?v=gwd-wLdIHjs'
 * 
 *    - OPTION B (Local): 
 *      1. Create a folder named 'assets' inside the 'public' folder of your project.
 *      2. Drag your MP4 file into that folder (e.g., 'breathing.mp4').
 *      3. Reference it here: videoUrl: '/assets/breathing.mp4'
 * 
 *    - OPTION C (Cloud): Direct link to MP4 file.
 * 
 * 4. AUDIO SCRIPTS (Text-to-Speech):
 *    - If you don't have an audio file, you can provide an 'audioScript'.
 *    - The app will read this text aloud using the device's voice.
 * ==========================================
 */

import { Module } from '../types';
import { BOT_ID } from '../secrets';

// Helper to get a consistent nature image URL
const getImg = (id: string) => {
  const domain = id.startsWith('premium_') ? 'plus.unsplash.com' : 'images.unsplash.com';
  return `https://${domain}/${id}?q=80&w=800&auto=format&fit=crop`;
};

export const MODULES: Module[] = [
  // --- Category 1: Pain Understanding ---
  {
    id: 'und-1',
    categoryId: 'understanding',
    title: 'What is pain?',
    description: 'The biology of hurt and protection',
    thumbnailUrl: getImg('premium_photo-1681426643645-77d6b5130b50'), // Plant growing (Growth/Life)
    duration: '4 min',
    reflectionPrompt: 'How does understanding pain as a protective signal shaped by your brain change the way you look at your own pain experience?',
    steps: [
      {
        title: "Pain as a Protective Signal",
        content: `Pain is more than just a physical sensation. It is an unpleasant sensory and emotional experience that signals actual or potential harm to the body. At its core, pain acts like a diligent guardian: it alerts you when something needs attention and encourages you to protect yourself. Although pain can be distressing, it serves an important purpose—much like sight or hearing—by helping you avoid danger. Your brain interprets pain signals together with your thoughts, emotions, and past experiences, which is why pain feels different from person to person.`,
        imageUrl: getImg('premium_photo-1681426643645-77d6b5130b50')
      },
      {
        title: "The Body’s Alarm Network",
        content: `From a biological perspective, pain begins when specialized sensors called nociceptors in your skin, muscles, or organs detect injury or inflammation. These sensors send signals through nerves to the spinal cord, which acts as a relay station before passing the information on to the brain. The brain is not a passive receiver. Instead, it evaluates these signals in context, considering factors such as past experiences, current stress, and emotional state to determine how strong and where the pain should be felt.`,
        imageUrl: getImg('premium_photo-1681426643645-77d6b5130b50')
      },
      {
        title: "Acute Pain vs. Chronic Pain",
        content: `Pain can be categorized by how long it lasts and what role it plays. Acute pain is short-term and usually linked to a clear cause, such as an injury. It fades as healing occurs and serves as a helpful warning. Chronic pain, however, lasts longer than three to six months and often continues even after tissues have healed. At this point, pain no longer serves a protective role and becomes a condition of its own that needs to be treated differently than acute pain.`,
        imageUrl: getImg('premium_photo-1681426643645-77d6b5130b50')
      }
    ]
  },
  {
    id: 'und-2',
    categoryId: 'understanding',
    title: 'Understanding Chronic Pain',
    description: 'How the system becomes hypersensitive',
    thumbnailUrl: getImg('photo-1518837695005-2083093ee35b'), // Water Ripples (Sensitivity)
    duration: '6 min',
    reflectionPrompt: 'How does this change your view of your symptoms?',
    steps: [
      {
        title: "An Overprotective Alarm System",
        content: `Chronic pain develops when the nervous system becomes sensitized over time. The nerves involved in pain processing change and become more easily activated. As a result, the brain and spinal cord lower their threshold for danger signals. This means that normal sensations—such as gentle movement or light touch—may be interpreted as threatening. Chronic pain is like a smoke alarm that was designed to warn of fire but now goes off when someone lights a candle.`,
        imageUrl: getImg('photo-1518837695005-2083093ee35b'),
        videoUrl: 'https://youtu.be/i2VQcU_byWg',
        videoPosition: 'below-text'
      },
      {
        title: "How the Brain Learns Pain",
        content: `The brain learns through repetition, and pain is no exception. When pain signals are sent repeatedly, the brain builds strong neural pathways that make the sensation easier to trigger. Over time, even small or harmless stimuli can activate the full pain response. In some cases, pain may occur without any clear physical cause because the brain has learned to expect danger. This explains why chronic pain can persist long after the original injury has healed.`,
        imageUrl: getImg('photo-1518837695005-2083093ee35b')
      },
      {
        title: "The Biopsychosocial Model",
        content: `Today, pain is understood through the biopsychosocial model, which highlights the interaction of biological, psychological, and social factors. Biological factors include injury or inflammation. Psychological factors involve thoughts, emotions, and stress levels. Social factors include relationships, work, and daily environment. These elements influence each other continuously. For example, physical pain may lead to low mood, which can reduce activity and social contact—further intensifying pain. The encouraging part is that this model shows there are many ways to influence pain, not just through medical treatments.`,
        imageUrl: getImg('photo-1518837695005-2083093ee35b')
      }
    ]
  },
  {
    id: 'und-3',
    categoryId: 'understanding',
    title: 'Thoughts, Emotions & Behavior',
    description: 'The cycle of pain interaction',
    thumbnailUrl: getImg('photo-1761816336242-ddeec5263e93'), // Sunrise over hills (Interconnected layers)
    duration: '5 min',
    reflectionPrompt: 'Can you identify a thought that made pain worse?',
    steps: [
      {
        title: "How Thoughts Shape Pain",
        content: `Your brain constantly interprets incoming signals, and your thoughts act like filters that shape this interpretation. Certain thinking patterns, such as catastrophizing—assuming the worst possible outcome—can increase pain intensity. Thoughts like “This will never get better” or “I have no control” signal danger to the brain, which heightens pain sensitivity. In contrast, developing an internal sense of control—the belief that you can influence your situation—has been linked to reduced pain intensity and frequency over time.`,
        imageUrl: getImg('photo-1761816336242-ddeec5263e93')
      },
      {
        title: "The Role of Emotions",
        content: `Pain is both a physical and emotional experience. Emotions such as fear, anxiety, and helplessness can strongly amplify pain signals. Stress often leads to muscle tension, reduced recovery, and increased sensitivity, creating a vicious cycle. When the brain interprets emotional distress as a threat, it turns up the internal “volume knob” on pain. Imagine pain as a movie soundtrack: your emotions and thoughts are the sound engineers, sometimes making the most intense moments even louder.`,
        imageUrl: getImg('photo-1761816336242-ddeec5263e93')
      },
      {
        title: "Breaking the Cycle and Moving Forward",
        content: `Common responses to pain include avoiding movement out of fear or pushing through pain at all costs. While avoidance may feel protective, it often leads to muscle weakness, reduced confidence, and social withdrawal—factors that worsen pain over time. A more helpful approach is to reconnect with meaningful activities and make choices based on your values rather than fear. Techniques such as relaxation, mindfulness, and gradual, balanced movement can help calm the nervous system. Over time, this retrains the brain’s alarm system and supports a return to a fuller, more active life.`,
        imageUrl: getImg('photo-1761816336242-ddeec5263e93')
      }
    ]
  },

  // --- Category 2: Pain Triggers ---
  {
    id: 'trig-1',
    categoryId: 'triggers',
    title: 'Stress',
    description: 'Identifying and managing emotional triggers.',
    thumbnailUrl: getImg('photo-1688880229098-f67e3be3c1f6'), // Rain on glass (Mood/Tension)
    duration: '5 min',
    reflectionPrompt: 'How does stress manifest in your body?',
    steps: [
       {
        title: "The Biology of Stress",
        content: `Stress is not simply something that happens to you from the outside; it is the brain’s assessment that the demands of a situation exceed your current coping resources. Whether the pressure comes from work, relationships, or daily respons, the brain reacts in the same way. It does not clearly distinguish between emotional and physical threats. When stress is perceived, the brain activates its internal alarm system, triggering bodily responses such as increased heart rate, faster breathing, and muscle tension—all of which can contribute to physical discomfort.`,
        imageUrl: getImg('photo-1688880229098-f67e3be3c1f6')
      },
      {
        title: "Tension and Sensitivity",
        content: `When this alarm system stays active for long periods, it can lead to a vicious cycle of tension and increased sensitivity. Chronic stress keeps muscles in a constant state of guarding, placing ongoing strain on tissues and joints. At the same time, the nervous system becomes more reactive, lowering the threshold at which pain is felt. In effect, the brain’s command center turns up the volume on pain signals because it believes the body is under continuous threat. This process, known as sensitization, explains why even minor stressors can trigger strong physical symptoms.`,
        imageUrl: getImg('photo-1688880229098-f67e3be3c1f6')
      },
      {
        title: "Finding Your Balance",
        content: `Breaking this cycle involves helping the nervous system relearn that it is safe. By regulating stress responses, you can signal to the brain that the danger has passed, allowing it to dial down its alarm system. This also supports the release of the body’s own pain-inhibiting and calming chemicals. In the following modules, you will explore practical strategies—such as targeted relaxation and energy management—that help reduce daily stress load, calm the nervous system, and restore a sense of balance.`,
        imageUrl: getImg('photo-1688880229098-f67e3be3c1f6')
      }
    ]
  },
  {
    id: 'trig-5',
    categoryId: 'triggers',
    title: 'Anxiety',
    description: 'Calming the nervous system',
    thumbnailUrl: getImg('photo-1766849854827-4fac0a28da60'), // Stormy Ocean (Inner turmoil)
    duration: '6 min',
    reflectionPrompt: 'When do you feel most anxious?',
    steps: [
        {
            title: "Fear as a Pain Amplifier",
            content: `Fear and anxiety can strongly influence pain because the brain processes emotional threat and physical sensations together. When you feel anxious, your brain’s “attention spotlight” often locks onto pain, making it feel more intense and harder to ignore. This reaction is rooted in survival: the brain is designed to focus on anything it perceives as dangerous. Over time, frequent anxiety can place the nervous system in a state of hypervigilance, constantly scanning the body for signs of threat and amplifying even mild sensations.`,
            imageUrl: getImg('photo-1766849854827-4fac0a28da60')
        },
        {
            title: "The Cycle of Avoidance",
            content: `Anxiety often leads to a pattern known as fear-avoidance, where concern about worsening pain causes you to limit movement and gradually withdraw from activities and social contact. While avoiding activity may feel protective, it often leads to muscle weakness, stiffness, and lower physical confidence. Social withdrawal and ongoing stress often go hand in hand with a low or depressed mood. At the same time, low mood is linked to a reduced release of endorphins—the body’s natural pain-relieving and mood-lifting chemicals. With fewer endorphins available, pain receptors become more easily excitable, increasing overall pain sensitivity. Together, physical deconditioning, emotional withdrawal, and biochemical changes lower pain tolerance and make the nervous system more reactive, so even harmless movements or situations can trigger a strong alarm response.`,
            imageUrl: getImg('photo-1766849854827-4fac0a28da60')
        },
        {
            title: "Stepping Into Resilience",
            content: `Reducing the impact of fear begins with learning to notice anxious thoughts without letting them control your behavior. By gently re-engaging in meaningful activities and focusing on what matters to you, you can help retrain your nervous system. Gradual exposure to movement, combined with skills like mindfulness and relaxation, teaches the brain that activity is safe. In the next units, you will learn practical tools to build resilience, rebuild trust in your body, and improve your quality of life.`,
            imageUrl: getImg('photo-1766849854827-4fac0a28da60')
        }
    ]
  },
  {
    id: 'trig-3',
    categoryId: 'triggers',
    title: 'Negative Cognitions',
    description: 'Identifying patterns, catastrophizing, and practice.',
    thumbnailUrl: getImg('premium_photo-1762250488153-9e9b5c716dc1'), // Stormy forest/Mist
    duration: '20 min',
    // Fallback/General prompt if a sub-module doesn't have one
    reflectionPrompt: 'Which of these thinking patterns do you recognize most in your daily life?',
    steps: [], 
    subModules: [
      {
        id: 'sm-pattern',
        title: 'Thinking Patterns',
        type: 'knowledge',
        duration: '5 min',
        step: {
            title: 'Thinking Patterns',
            content: `Living with ongoing pain naturally affects the way you think. The mind is constantly trying to understand sensations, anticipate what might happen next, and protect you from harm. In this process, it can slip into cognitive distortions—unhelpful thinking patterns that influence how you interpret pain, how you feel emotionally, and how you respond. While these thoughts are common and human, they can become problematic when they are frequent or extreme, as they increase stress and make the nervous system more sensitive. Common patterns include magnification (overestimating the impact of symptoms), all-or-nothing thinking (“always” or “never”), and disqualifying the positive (overlooking good moments or progress and focusing only on pain).`,
            imageUrl: getImg('premium_photo-1762250488153-9e9b5c716dc1')
        }
      },
      {
        id: 'sm-cat',
        title: 'Catastrophizing',
        type: 'knowledge',
        duration: '5 min',
        step: {
            title: 'Catastrophizing',
            content: `One of the most powerful distortions in pain is catastrophizing—automatically assuming the worst possible outcome. This can sound like: “This will never end,” “Something must be seriously wrong,” or “I’ll end up unable to live my life.” Because the brain is your threat-detection center, it can treat these thoughts as evidence of real danger. That activates the body’s alarm system, increasing tension, attention to symptoms, and often the intensity of pain itself. 

The first step toward change is remembering: thoughts are not facts—they are mental events, not predictions or diagnoses. You can learn to slow down and “put a thought on trial” by checking the evidence for and against it, and by exploring more balanced possibilities. This doesn’t mean forcing positive thinking; it means shifting from fear-driven conclusions to a more realistic, supportive perspective that helps your nervous system feel safer.`,
            imageUrl: getImg('premium_photo-1762250488153-9e9b5c716dc1')
        }
      },
      {
        id: 'sm-decat',
        title: 'Decatastrophizing',
        type: 'technique',
        duration: 'Self-paced',
        botId: BOT_ID,
        // This specific prompt is now attached to this sub-module
        reflectionPrompt: 'Let\'s practice decatastrophizing. Tell me about a worry you have right now, and we will try to break it down together.',
        step: {
            title: 'Decatastrophizing',
            content: `Decatastrophizing is a cognitive behavioral technique that helps you recognize when pain-related thoughts jump to the worst possible outcome. By gently examining these thoughts, you can reduce their emotional impact and create more mental space.

In this dialogue, you’ll be guided through a short, structured reflection. Here’s what we’ll cover:

\u00A0\u00A0• Gently identifying a pain-related thought that feels overwhelming
\u00A0\u00A0• Pausing to look at it with some distance and openness
\u00A0\u00A0• Considering alternative, more realistic perspectives
\u00A0\u00A0• Noticing how this process can ease emotional strain and support coping

Decatastrophizing needs practice, feel free to repeat this exercise as many times you like.`,
            imageUrl: getImg('premium_photo-1762250488153-9e9b5c716dc1')
        }
      }
    ]
  },
  {
    id: 'trig-2',
    categoryId: 'triggers',
    title: 'Avoidance of activity',
    description: 'Discover how avoiding activity increases your pain.',
    thumbnailUrl: getImg('photo-1758438919146-f3f59a6d2544'), // Sunlight on Forest Path
    duration: '6 min',
    reflectionPrompt: 'Is there an activity you have stopped doing because of fear?',
    steps: [
      {
        title: "When Protection Becomes a Trap",
        content: `In acute injuries such as a fracture or burn, pain plays an important protective role by signaling you to rest and allow healing. This instinct is useful and necessary. In chronic pain, however, the same protective response can become misleading. The brain may continue to interpret everyday movements as dangerous, even when the body has healed. To stay safe, it keeps the pain alarm switched on and encourages avoidance. Over time, this breaks trust in the body and reinforces the belief that movement itself is harmful.`,
        imageUrl: getImg('photo-1758438919146-f3f59a6d2544'),
      },
      {
        title: "The Cost of Inactivity",
        content: `Avoiding movement may reduce discomfort in the short term, but prolonged inactivity has clear physical consequences. Muscles weaken when they are not used, joints become stiffer, and endurance declines. These changes increase strain on the body and can lead to more tension and fatigue, which further sensitizes the nervous system. Over time, this creates a vicious cycle: less movement leads to more sensitivity, which in turn reinforces avoidance. Rather than promoting recovery, long-term rest can unintentionally sustain and intensify chronic pain.`,
        imageUrl: getImg('photo-1758438919146-f3f59a6d2544'),
      },
      {
        title: "Reclaiming Life Through Balanced Movement",
        content: `A healthy amount of movement is essential for recovery. The goal is not to avoid activity or to push through pain at all costs, but to find a balanced level of load that helps you regain trust in your body. This means gradually decoupling pain from activity and orienting yourself around fixed goals or time-based plans rather than your pain limit. Increase activities slowly and in small steps. Remember that everyone has their own capacity—some people tend to avoid out of fear, while others push themselves too hard. Both patterns can keep pain going. Balanced, consistent movement helps calm the nervous system, prevents exhaustion, and allows you to expand your personal activity range over time.`,
        imageUrl: getImg('photo-1758438919146-f3f59a6d2544')
      }
    ]
  },

  // --- Category 3: Coping Strategies ---
  {
    id: 'cope-1',
    categoryId: 'coping',
    title: 'Relaxation',
    description: 'Muscle release techniques',
    thumbnailUrl: getImg('premium_photo-1762870549606-071412193f57'), // Deep Forest/Greenery
    duration: '30 min',
    reflectionPrompt: 'What helps you relax?',
    steps: [],
    subModules: [
        {
            id: 'sm-relax-resp',
            title: 'The Relaxation Response',
            type: 'knowledge',
            duration: '5 min',
            step: {
                title: "The Relaxation Response",
                content: `You cannot be stressed and relaxed at the same time. By deliberately inducing relaxation, you signal to your brain that you are safe. This lowers the alarm sensitivity. Techniques include deep breathing, progressive muscle relaxation, or somatic tracking.

For relaxation to be most effective, regular and long-term application is vital. Consistency helps your brain "unlearn" its hypersensitivity and can actually reduce pain signals over time. It is helpful to practice in a quiet environment and build these exercises into your daily routine, such as practicing at the same time each day to make it a habit.`,
                imageUrl: getImg('premium_photo-1762870549606-071412193f57')
            }
        },
        {
            id: 'sm-deep-breathing',
            title: 'Deep Breathing',
            type: 'technique',
            duration: '10 min',
            reflectionPrompt: 'How did your body feel during the long exhales?',
            step: {
                title: "Deep Breathing",
                content: `Diaphragmatic breathing helps flip the switch from "fight or flight" to "rest and digest".

1. Find a comfortable position, sitting or lying down.
2. Place one hand on your chest and one on your belly.
3. Inhale slowly through your nose for 4 seconds. Feel your belly rise against your hand. The hand on your chest should remain still.
4. Exhale slowly through your mouth for 6 seconds, like you are blowing out a candle. Feel your belly fall.
5. Repeat this cycle for several minutes.

This rhythmic breathing stimulates the Vagus nerve, acting as a brake pedal for your stress system.`,
                imageUrl: getImg('premium_photo-1762870549606-071412193f57')
            }
        },
        {
            id: 'sm-pmr',
            title: 'Progressive Muscle Relaxation',
            type: 'technique',
            duration: '15 min',
            reflectionPrompt: 'Which muscle group held the most tension?',
            step: {
                title: "Progressive Muscle Relaxation",
                content: `Progressive Muscle Relaxation (PMR) involves tensing and then relaxing specific muscle groups to release physical tension.

In this guided exercise, you will move through the body, deliberately creating tension in specific muscles for a few seconds, and then releasing it suddenly to experience a deepening state of relaxation.`,
                imageUrl: getImg('premium_photo-1762870549606-071412193f57'),
                audioUrl: 'https://drive.google.com/file/d/1PGbuXhJQ_QRFPQhUfcEx3w3c9vf40j74/view?usp=drive_link'
            }
        }
    ]
  },
  {
    id: 'cope-3',
    categoryId: 'coping',
    title: 'Mindfulness',
    description: 'Techniques for present moment awareness.',
    thumbnailUrl: getImg('photo-1506126613408-eca07ce68773'), // Meditating Silhouette/Nature (Peace)
    duration: '40 min',
    reflectionPrompt: 'Have you practiced mindfulness before?',
    steps: [],
    subModules: [
      {
        id: 'sm-mindfulness-intro',
        title: 'What is Mindfulness?',
        type: 'knowledge',
        duration: '5 min',
        step: {
            title: 'What is Mindfulness?',
            content: `Mindfulness involves consciously perceiving the here and now with a neutral, non-judgmental attitude. It focuses on acceptance, careful observation, and present-moment awareness, enabling conscious action rather than automatic reactions. This practice improves stress tolerance and calms the vegetative nervous system. 
                        
Engaging the mind with neutral focus can reduce pain perception and signal transmission to the brain. Instead of thinking 'This hurts, it's terrible,' we practice thinking 'I notice a sensation of heat and tightness.`,          

            imageUrl: getImg('photo-1506126613408-eca07ce68773')
        }
      },
      {
        id: 'sm-body-scan',
        title: 'Body Scan',
        type: 'technique',
        duration: '20 min',
        reflectionPrompt: 'Did you notice any areas of tension you were holding onto?',
        step: {
            title: 'Body Scan',
            content: `The Body Scan is a practice where we systematically sweep our attention through the body, usually from the feet up to the head.
            
The goal is not to force relaxation, but to simply notice sensations. We might notice warmth, coolness, tingling, or tension. When we find tension, we can imagine breathing into it, allowing it to soften.`,
            imageUrl: getImg('photo-1506126613408-eca07ce68773'),
            audioUrl: 'https://drive.google.com/file/d/1RjXPuQYUlgmRw0uw7358BwHXdYhAWwCz/view?usp=drive_link'
        }
      },
      {
        id: 'sm-breathing',
        title: 'Breathing Meditation',
        type: 'technique',
        duration: '15 min',
        reflectionPrompt: 'How did your body respond to the focused breathing?',
        step: {
            title: 'Breathing Meditation',
            content: `This practice uses the breath as an anchor. Whenever the mind wanders to the past or future (which it will), we gently escort our attention back to the physical sensation of breathing.
            
By focusing on the rhythm of the breath, we activate the parasympathetic nervous system, signaling safety to the body and lowering the pain alarm.`,
            imageUrl: getImg('photo-1506126613408-eca07ce68773'),
            audioUrl: 'https://drive.google.com/file/d/1SQTkZDQdFdaATpg-DFXFXT0OZGTOHurS/view?usp=drive_link'
        }
      },
      {
        id: 'sm-mindfulness-coach',
        title: 'Mindfulness Coaching',
        type: 'technique',
        duration: 'Interactive',
        // reflectionPrompt removed to hide reflection section on this page
        step: {
            title: 'Mindfulness Coaching',
            content: `Connect with your personal mindfulness coach.
            
Tap the microphone icon below to start a voice conversation. You can ask for a guided meditation, breathing exercises, or simply talk about what's on your mind.`,
            imageUrl: getImg('photo-1506126613408-eca07ce68773'),
            customWidget: 'elevenlabs-mindfulness-coach'
        }
      }
    ]
  },
  {
    id: 'cope-10',
    categoryId: 'coping',
    title: 'Acceptance',
    description: 'Making room for pain',
    thumbnailUrl: getImg('photo-1470252649378-9c29740c9fa8'), // Open Field at Sunrise (Vastness/Space)
    duration: '4 min',
    reflectionPrompt: 'What does acceptance mean to you?',
    steps: [],
    subModules: [
        {
            id: 'sm-acceptance-power',
            title: 'The Power of Acceptance',
            type: 'knowledge',
            duration: '5 min',
            reflectionPrompt: 'What does acceptance mean to you?',
            step: {
                title: "The Power of Acceptance",
                content: `Acceptance means adopting a more flexible and compassionate way of relating to your pain. It is the conscious choice to step out of the exhausting struggle with sensations, thoughts, and emotions that cannot be fully controlled right now. Acceptance is not resignation or giving up. Rather, it is an active and courageous decision to meet the present moment as it is, so that your energy can be used to build a meaningful life instead of fighting an endless inner battle.

Research shows that trying to force pain away often makes it more dominant, as the brain’s attention becomes tightly focused on it. By letting go of the need for total control, you can begin to separate the physical sensation of pain from the additional suffering created by fear, tension, and avoidance. When pain is no longer treated as an enemy to defeat, the nervous system can gradually calm and become less reactive.

The goal of acceptance is to ensure that pain no longer runs your life. By shifting focus from constant pain reduction to what truly matters to you—such as relationships, purpose, or personal growth—you reclaim direction and agency. Even if pain remains present, you can take small, meaningful steps toward a rich and fulfilling life, rather than waiting for pain to disappear before you begin living.`,
                imageUrl: getImg('photo-1470252649378-9c29740c9fa8')
            }
        },
        {
            id: 'sm-somatic-tracking',
            title: 'Somatic Tracking',
            type: 'technique',
            duration: '10 min',
            reflectionPrompt: 'What quality of the sensation did you notice most clearly?',
            step: {
                title: "Somatic Tracking",
                content: `Somatic Tracking involves observing your physical sensations with a sense of safety and curiosity, rather than fear or judgment.

1.  **Get Comfortable:** Sit or lie down in a relaxed position. Close your eyes if it helps.
2.  **Shift Attention:** Gently bring your attention to an area of discomfort. Don't try to push it away.
3.  **Curious Observation:** Watch the sensation like a neutral observer. Ask yourself: "Is it sharp or dull? Is it hot or cold? Is it moving or still?"
4.  **Safety Messages:** As you observe, remind yourself: "This is just a sensation. It is unpleasant, but it is not dangerous. I am safe."
5.  **Outcome Independence:** Let go of the goal to make the pain stop. Your only goal is to watch it safely.`,
                imageUrl: getImg('photo-1470252649378-9c29740c9fa8')
            }
        }
    ]
  },
  {
    id: 'cope-11',
    categoryId: 'coping',
    title: 'Navigating Medical Treatments',
    description: 'Making informed choices for your care journey.',
    thumbnailUrl: getImg('photo-1501785888041-af3ef285b470'), // Compass in Nature (Navigation/Direction)
    duration: '10 min',
    reflectionPrompt: 'How do you manage your medical care decisions?',
    steps: [
        {
            title: "Medication as a Support Tool",
            content: `Medication often plays an important role in pain treatment, especially in the early or acute phase. The main goal at this stage is to reduce pain quickly and prevent the nervous system from developing a persistent “pain memory.” In chronic pain, however, medication usually becomes one part of a broader, multimodal approach that also includes movement, psychological strategies, and lifestyle adjustments. Rather than “fixing” pain on its own, medication mainly serves to support daily functioning so you can engage in the active strategies that help calm and retrain the nervous system over time.`,
            imageUrl: getImg('photo-1501785888041-af3ef285b470')
        },
        {
            title: "When to Treat Further - and When to Shift Focus",
            content: `Many people reach a point where repeated medical treatments bring diminishing returns: more side effects, more frustration, but little lasting relief. Deciding whether to continue searching for new treatments or to shift focus is a deeply personal process and should be discussed openly with your healthcare team. Letting go does not mean giving up—it means redirecting energy from “curing” pain to managing it. When treatments no longer improve function or quality of life, working on pain acceptance, nervous system regulation, and meaningful activity can be more empowering than pursuing the next medical option.`,
            imageUrl: getImg('photo-1501785888041-af3ef285b470')
        },
        {
            title: "Working With Your Healthcare Team",
            content: `Finding the right balance requires patience and professional guidance. Always involve a doctor when taking pain medication regularly, including over-the-counter drugs. Regular reviews help ensure that ineffective treatments are stopped and side effects are minimized. You have the right to ask questions, express doubts, and co-decide on whether continuing escalation makes sense - or whether it is time to stabilize treatment and focus on self-management and quality of life.`,
            imageUrl: getImg('photo-1501785888041-af3ef285b470')
        }
    ]
  }
];
