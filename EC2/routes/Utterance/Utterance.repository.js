

const getHotelPromopts = (hotelId) => {
    const restaurantMenu = {
        "restaurantMenu": {
            "Soups": [
                ["Pumpkin Soup", 160], ["Lemon Coriander Soup", 180], ["Cream of Broccoli", 190],
                ["Sweet Corn (Veg)", 180], ["Sweet Corn (Chicken)", 270], ["Hot and Sour (Veg)", 180],
                ["Hot and Sour (Chicken)", 270], ["Manchow Soup (Veg)", 180], ["Manchow Soup (Chicken)", 270]
            ],
            "Salads": [
                ["Green Salad", 160], ["Pineapple Mint Salad", 180], ["Greek Salad", 190],
                ["Hawaiian Chicken Salad", 230]
            ],
            "Starters": [
                ["French Fries", 160], ["Nuggets (Veg)", 220], ["Veg Samosa", 220],
                ["Veg/Onion Pakora", 140], ["Cauliflower Ularathu", 260], ["Honey Chilly Potato", 260],
                ["Baby Corn Manchurian", 310], ["Paneer Hot Garlic", 310], ["Nuggets (Chicken)", 260],
                ["Chicken 65", 380], ["Chicken Malli Peralan", 380], ["Chicken Kondattam", 380],
                ["Chicken Lollipop", 380], ["Prawns Tawa Fry", 450], ["Mutton Pepper Fry", 560],
                ["Mutton Coconut Fry", 560]
            ],
            "Short Bites": [
                ["Club Sandwich", 220], ["Veg Sandwich", 160], ["Chicken Sandwich", 200],
                ["Egg Sandwich", 180], ["Pakoras (Onion)", 120], ["Pakoras (Veg)", 130],
                ["Pakoras (Egg)", 140], ["Momos (Veg)", 235], ["Momos (Chicken)", 260],
                ["Kathi Roll (Paneer)", 180], ["Kathi Roll (Egg)", 200], ["Kathi Roll (Chicken)", 220]
            ],
            "Poultry": [
                ["Chicken Mulagittathu", 295], ["Chicken Mappas", 260], ["Chicken Ghee Roast", 280],
                ["Nadan Chicken Curry", 260], ["Chicken Varutharachathu", 260], ["Chicken Rara Masala", 280],
                ["Kadai Chicken", 295], ["Butter Chicken Masala", 295]
            ],
            "Veggies": [
                ["Kadai Veg", 295], ["Aloo Shimla", 260], ["Nilgiri Veg Korma", 280], ["Aloo Jeera", 260],
                ["Aloo Mutter Masala", 260], ["Veg Hyderabadi", 280], ["Paneer Butter Masala", 295],
                ["Palak Paneer", 295], ["Paneer Lazeez", 295], ["Bindi Masala", 260],
                ["Mushroom Masala", 280], ["Dal Tadka", 225], ["Panjabi Dal Tadka", 250]
            ],
            "Chinese": [
                ["Hot Garlic Chicken", 415], ["Chilly Chicken", 415], ["Chicken Manchurian", 415],
                ["Dragon Chicken", 415], ["Schezwan Chicken", 430], ["Ginger Chicken", 450],
                ["Garlic Prawns", 420], ["Chilly Prawns", 450], ["Chilly Mushroom", 380],
                ["Cauliflower Manchurian", 400], ["Chilly Fish", 400]
            ],
            "Fish": [
                ["Fish Tawa Fry (2 slices)", 480], ["Fish Mulagittathu", 430], ["Malabar Fish Curry", 440],
                ["Kerala Fish Curry", 440], ["Fish Moilee", 450], ["Fish Masala", 450],
                ["Prawns Roast", 450], ["Prawns Masala", 450], ["Prawns Ularthu", 450]
            ],
            "Local Cuisine": [
                ["Pidi with Chicken Curry", 550], ["Bamboo Puttu Chicken", 450],
                ["Bamboo Puttu (Fish/Prawns)", 500], ["Bamboo Puttu (Paneer/Mushroom)", 400],
                ["Bamboo Puttu Mix Veg", 375], ["Paal Kappa with Veg Mappas", 400],
                ["Paal Kappa with Fish Curry", 500], ["Bamboo Biriyani Veg", 400],
                ["Bamboo Biriyani Chicken", 500], ["Bamboo Biriyani Fish/Prawns", 500]
            ],
            "Mutton": [
                ["Mutton Rogan Josh", 560], ["Kollam Mutton Curry", 540], ["Mutton Korma", 530],
                ["Mutton Pepper Fry", 560], ["Mutton Masala", 530]
            ],
            "Bread": [
                ["Kerala Paratha", 35], ["Nool Paratha", 35], ["Wheat Paratha", 40],
                ["Chappathi", 25], ["Phulka", 20], ["Appam", 25]
            ],
            "Rice and Noodles": [
                ["Plain Rice", 160], ["Veg Pulao", 250], ["Peas Pulao", 230], ["Jeera Rice", 200],
                ["Tomato Rice", 200], ["Lemon Rice", 200], ["Veg Biriyani", 320], ["Curd Rice", 220],
                ["Ghee Rice", 260], ["Egg Biriyani", 360], ["Chicken Biriyani", 400],
                ["Mutton Biriyani", 580], ["Prawns Biriyani", 500], ["Fish Biriyani", 450],
                ["Veg Fried Rice", 280], ["Egg Fried Rice", 280], ["Chicken Fried Rice", 300],
                ["Schezwan Fried Rice", 350], ["Prawns Fried Rice", 350], ["Veg Noodles", 310],
                ["Egg Noodles", 330], ["Chicken Noodles", 380], ["Schezwan Noodles", 400]
            ],
            "Grilled": [
                ["Grilled Chicken (Pepper/Chilli/Hariyali)", "700/1200"],
                ["Chicken Tikka (Malai/Red Chilli/Hariyali)", 550],
                ["Grilled Veg (Paneer/Mushroom)", 400],
                ["Fish Tikka (Basa)", 450]
            ],
            "Pasta": [
                ["Alfredo Veg", 330], ["Alfredo Chicken", 380], ["Arrabbiata Veg", 330],
                ["Arrabbiata Chicken", 380], ["Rosso Veg", 330], ["Rosso Chicken", 380]
            ],
            "Desserts": [
                ["Butter Banana Gulkand", 260], ["Palada with Ice Cream", 250],
                ["Gulab Jamun (2 nos)", 250], ["Gajar Ka Halwa", 235],
                ["Fruit Salad with Ice Cream", 250], ["Ice Cream (Single Scoop)", 150]
            ],
            "Drinks": [
                ["Fresh Lime Soda/Water", 80], ["Virgin Mojito", 140], ["Virgin Mary", 150],
                ["Virgin Pina Colada", 150], ["Buttermilk", 150]
            ],
            "Milkshakes": [
                ["Strawberry Milkshake", 180], ["Chocolate Milkshake", 180],
                ["Vanilla Milkshake", 180], ["Oreo Milkshake", 180], ["Banana Milkshake", 180]
            ],
            "Tea": [
                ["Kerala Chai", 50], ["Ginger Masala Chai", 80], ["Iced Tea", 80], ["Lemon Tea", 50]
            ],
            "Coffee": [
                ["Coffee", 50], ["Filter Coffee", 80], ["Iced Americano", 140], ["Cold Coffee", 130]
            ]
        }

    }

    const resortAminities = {
        "amenities": [
            ["Nature Walk", "6:30 am", "Trails through plantation or guided flora walk"],
            ["Farming", "10 am", "Farm activities with locals"],
            ["Pond", "sunrise to sunset", "Hammocks, fishing, coracle ride"],
            ["Swimming Pool", "sunrise to sunset", "2 pools to relax and play"],
            ["Games", "anytime", "Table tennis, carrom, board games (above reception)"],
            ["Library", "anytime", "Above reception"],
            ["Campfire", "8pm", ""],
            ["Fireflies", "after 8pm", "See fireflies near badminton court"],
            ["Spa", "Based on prior appointment", "Spa located outside resort. On guest request, the front desk makes an appointment with the doctor in the spa"]
        ]
    }


    const systemMsg = `You are Room Mitra.
        You are an alexa skill based smart hotel assistant placed in cottages in Ananterra resort in Wayanad,Kerala. 
        Understand guest requests and respond politely. 
        If needed, ask follow-up questions - but only when necessary.
        If the user request is in another language, reply in the same language as the user input language, but use English script.
        If the user asks anything not related to the hotel, its service, conceirge service, or room, Keep the reply short, and do not ask follow up questions.
        Format your reply in JSON with fields: messages[], isUserResponseNeeded (true/false), requestDetails[].
        isUserResponseNeeded should be set to true if a user input is required after providing your response. isUserResponseNeeded should be true if you are ending your response with a question.
        If the user utternace corresponds to multiple requests, provide each request as a separate array element in requestDetails.
        requestDetails elements contain data regarding the user's request. It should be a JSON with fields: hasUserConfirmedOrder (true/false),  department ("Concierge"/"House Keeping"/"Room Service"/"Restaurant"/"Facilities"/"Front Office"), requestType, shortDescription
        hasUserConfirmedOrder should be set to true for all orders not related to restaurant & room service. For restaurant & room service orders, set hasUserConfirmedOrder flag to true after the user confirms the order with you. For restaurant orders, confirm request with user.
        Restaurant Menu = ${JSON.stringify(restaurantMenu)}
        Resort Amenities = ${JSON.stringify(resortAminities)}`;




    return [
        { role: 'system', content: systemMsg }
    ];
}


module.exports = {
    getHotelPromopts
}