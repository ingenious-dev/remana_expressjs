// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
// 
// While the test required an OPEN API integration for populating the
// dummy data. This was used instead due to RPM limitations encountered
// on other usecases (e.g AI Search). Check developer notes or submition
// documentation for the test.
// 
// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +

// <<<<<<<<<<>>>>>>>
// utility functions
function subtractDays(date, days) {
    var date_copy = new Date(date.valueOf());
    date_copy.setDate(date_copy.getDate() - days);
    return date_copy;
}
function addDays(date, days) {
    var date_copy = new Date(date.valueOf());
    date_copy.setDate(date_copy.getDate() + days);
    return date_copy;
}
function getRandomInt(max, min=0) {
    return Math.max(min, Math.floor(Math.random() * max));
}
function getDateOnly(item) {
    var month = `${item.getMonth() + 1}`;
    month = month.length > 1 ? month : `0${month}`;

    var day = `${item.getDate()}`;
    day = day.length > 1 ? day : `0${day}`;

    return `${item.getFullYear()}-${month}-${day}`
}
// <<<<<<<<<<>>>>>>>

// <<<<<<<<<<>>>>>>>
// Activity data
// + https://chatgpt.com/share/6773de7a-9c88-8004-b182-9e5d951b1b75

const category_options = [
    'event', 'email'
]

const subject_event_options = [
    'Sustainability and Green Living',
    'Tech Trends and Innovations',
    'Art and Creativity Workshops',
    'Health and Wellness Summit',
    'Gaming and Esports Festival',
    'Entrepreneurship and Startups',
    'Digital Marketing Bootcamp',
    'Fitness and Yoga Retreat',
    'Cultural Heritage and Traditions',
]
const subject_email_options = [
    "You Won't Believe What's Coming Next!",
    "We've Got Big News for You!",
    "Your Exclusive Offer Awaits",
    "Just for You: A Little Something Special",
    "Limited Time: Don't Miss Out!",
    "Top 10 Tips You Need Right Now",
    "Big Savings Inside - Open Now!",
    "Can We Help You with This?",
    "Sneak Peek: What's New This Month",
]

const event_agenda = `Event Agenda: [Activity Name]
Date: [Event Date]
Time: [Start Time] - [End Time]
Location: [Venue/Online Platform]

Agenda Overview
[Start Time] - Registration and Welcome

Check-in and greet attendees
Distribute materials (if any)
Brief overview of the activity
[Start Time + 30 mins] - Opening Remarks

Welcome speech by [Speaker Name]
Introduction to the activity's purpose and goals
[Start Time + 45 mins] - Key Activity or Session 1

Description of the first session or main activity
[Optional] Guided instructions or presentation
[Start Time + 1.5 hours] - Break and Networking

Light refreshments/snacks provided
Open networking or Q&A session
[Start Time + 2 hours] - Key Activity or Session 2

Continue with the primary activity or additional sessions
Hands-on participation or breakout groups
[Start Time + 3 hours] - Closing Session

Summary of key takeaways
Feedback and discussion
Closing remarks by [Speaker Name]
[End Time] - Wrap-Up and Farewell

Distribute thank-you notes or goodies (if applicable)
Share follow-up information or resources
`
const email_body = `Hi [Recipient's Name],

We're thrilled to invite you to our upcoming activity, [Activity Name], happening on [Date] at [Location/Platform].

Here's what you can look forward to:

[Highlight 1]: A brief description of a key feature.
[Highlight 2]: Another engaging element.
[Highlight 3]: Something exciting or unique about the activity.
This is a fantastic opportunity to [benefit or outcome of participating] while connecting with others who share your interests.

Details at a Glance:

What: [Activity Name]
When: [Date and Time]
Where: [Location or Virtual Link]
Who: [Target Audience]
Don't miss out—reserve your spot now! Click below to sign up:
[Sign-Up Link or Call to Action Button]

We can't wait to see you there! If you have any questions, feel free to reach out at [Contact Email or Phone Number].

Best regards,
[Your Name]
[Your Organization Name]`

const location_options = [
    '17203 NW Military Hwy San Antonio, Texas 78257, US',
    'Ferentsa Rakotsi St, 12 Uzhorod , Zakarpattia 88000, UA',
    'Dunajska c. 5, Floor 4 Ljubljana, 1000, SI',
    'ABC Towers, Waiyaki Way Nairobi, Nairobi 00100, KE',

    'Nairobi, Kenya',
    'Kisumu, Kenya',
    'Mombasa, Kenya',
]
// <<<<<<<<<<>>>>>>>

async function populateUserAndActivity(accessToken, update_picture) {
    // <<<<<<<<<<>>>>>>>
    // STEP 1: Update profile picture
    // + https://randomuser.me/
    if(update_picture) {
        const response = await fetch('https://randomuser.me/api/');
        if (!response.ok) {
            // throw new Error(`Response status: ${response.status}`);
            return;
        }
        const json = await response.json();
        fetch('http://localhost:3000/auth/me', {
            method: 'PATCH',
            body: JSON.stringify({
                "profile_picture": json.results[0].picture.large
            }),
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        })
    }
    // <<<<<<<<<<>>>>>>>

    // <<<<<<<<<<>>>>>>>
    // STEP 2: Add activities
    var startDate = subtractDays(new Date(), 7);
    const dateRange = 7;
    const MAX_DAILY_ACIVITIES = 20;
    for (let day_index = 1; day_index <= dateRange; day_index++) {
        const date = addDays(startDate, day_index);
        const activity_date_str = getDateOnly(date)

        const no_of_activities = getRandomInt(MAX_DAILY_ACIVITIES, 1)
        for (let index = 0; index < no_of_activities; index++) {
            const category = category_options[getRandomInt(category_options.length)]
            
            const data = {
                category: category,
                subject: category == 'event'
                ? subject_event_options[getRandomInt(subject_event_options.length)]
                : subject_email_options[getRandomInt(subject_email_options.length)],
                agenda_or_body: category == 'event'
                ? event_agenda
                : email_body,
                date_of_activity: activity_date_str,
                location: location_options[getRandomInt(location_options.length)],
            }
            fetch('http://localhost:3000/activity', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            })
                // .then((resp) => resp.json())
                // .then(function(data) {
                //     // When POST succeeded
                //     console.log(data)
                // });
        }
    }
    // <<<<<<<<<<>>>>>>>
}

module.exports = { populateUserAndActivity }