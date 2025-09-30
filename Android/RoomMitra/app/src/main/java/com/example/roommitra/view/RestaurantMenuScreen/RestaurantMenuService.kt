package com.example.roommitra.view


// ---- Menu Data ----
object RestaurantMenuService {
    fun getRestaurantMenuData(): Map<String, List<Pair<String, DishInfo>>> {
        return mapOf(
            "Soups" to listOf(
                "Pumpkin Soup" to DishInfo(
                    cost = 160,
                    imgUrl = "https://www.recipetineats.com/tachyon/2017/10/Pumpkin-Soup-2.jpg?resize=500%2C500",
                    description = "A creamy, puréed soup made from cooked pumpkin, blended with stock, broth, onions, and garlic."
                ),
                "Lemon Coriander Soup" to DishInfo(
                    cost = 180,
                    imgUrl = "https://i0.wp.com/www.shanazrafiq.com/wp-content/uploads/2020/02/Lemon-Coriander-Soup-3.jpg?resize=681%2C1024&ssl=1",
                    description = "A tangy and refreshing soup made with lemon, coriander, and spices."
                ),
                "Cream of Broccoli" to DishInfo(
                    cost = 190,
                    description = "A smooth and creamy broccoli soup, lightly seasoned.",
                    imgUrl = "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcR1BY3pXhJFhDTEPXtlTFVnKNjKTOO8PHgEsvhYdcKS2-CslxL8znjJaHqtm83KC4fUqCy0aq5wESTeZM3PBx8yPKxKoGqoRVaOxb_8hAxA"
                ),
                "Tomato Basil Soup" to DishInfo(
                    cost = 170,
                    imgUrl = "https://www.twospoons.ca/wp-content/uploads/2021/02/vegan-tomato-basil-soup-recipe-creamy-twospoons-8.jpg",
                    description = "Classic tomato soup blended with fresh basil and cream."
                ),
                "Mushroom Soup" to DishInfo(
                    cost = 200,
                    imgUrl = "https://www.allrecipes.com/thmb/PKh_MtthZMtG1flNmud0MNgRK7w=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/13096-Cream-of-Mushroom-Soup-ddmfs-4x3-293-b505e37374d74e81807e8a93bcdd7bab.jpg",
                    description = "Creamy mushroom soup with sautéed mushrooms and garlic."
                )
            ),
            "Salads" to listOf(
                "Green Salad" to DishInfo(
                    160,
                    "Fresh mix of lettuce, cucumber, and tomato",
                    "https://www.allrecipes.com/thmb/XgWHycCFMP4eAvMfKXnX3pzC_DA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/ALR-14452-green-salad-VAT-hero-4x3-22eb1ac6ccd14e5bacf18841b9672313.jpg"
                ),
                "Greek Salad" to DishInfo(
                    190,
                    "Traditional Greek salad with feta and olives",
                    "https://hips.hearstapps.com/hmg-prod/images/greek-salad-index-642f292397bbf.jpg?crop=0.888888888888889xw:1xh;center,top&resize=1200:*"
                ),
                "Caesar Salad" to DishInfo(
                    210,
                    "Crisp romaine with Caesar dressing, croutons, and parmesan",
                    "https://www.noracooks.com/wp-content/uploads/2022/06/vegan-caesar-salad-4.jpg"
                ),
                "Quinoa Salad" to DishInfo(
                    200,
                    "Healthy quinoa salad with veggies and lemon dressing",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXBdbSa1Uk-5jGhPNZDrgfcG94c7P0eZfzXw&s"
                ),
                "Fruit Salad" to DishInfo(
                    180,
                    "Mixed seasonal fruits with a honey dressing",
                    "https://cdn.loveandlemons.com/wp-content/uploads/2025/06/fruit-salad.jpg"
                )
            ),
            "Starters" to listOf(
                "Spring Rolls" to DishInfo(
                    150,
                    "Crispy vegetable spring rolls with sweet chili sauce",
                    "https://d1mxd7n691o8sz.cloudfront.net/static/recipe/recipe/2023-12/Vegetable-Spring-Rolls-2-1-906001560ca545c8bc72baf473f230b4.jpg"
                ),
                "Chicken Wings" to DishInfo(250, "Spicy grilled chicken wings with dip"),
                "Paneer Tikka" to DishInfo(
                    220,
                    "Grilled marinated paneer cubes with spices",
                    "https://spicecravings.com/wp-content/uploads/2020/10/Paneer-Tikka-Featured-1.jpg"
                ),
                "Stuffed Mushrooms" to DishInfo(200, "Mushrooms stuffed with cheese and herbs"),
                "Potato Wedges" to DishInfo(150, "Crispy potato wedges served with ketchup")
            ),
            "Indian" to listOf(
                "Butter Chicken" to DishInfo(
                    280,
                    "Creamy tomato-based chicken curry",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN2jh7DvoLtDyDF6cigDHFrSMs5zMpaXRelA&s"
                ),
                "Paneer Butter Masala" to DishInfo(250, "Soft paneer cubes in rich tomato gravy"),
                "Chole Bhature" to DishInfo(220, "Spicy chickpea curry served with fried bread"),
                "Dal Makhani" to DishInfo(200, "Black lentils cooked with butter and cream"),
                "Biryani" to DishInfo(300, "Fragrant basmati rice cooked with meat or vegetables")
            ),
            "Asian" to listOf(
                "Fried Rice" to DishInfo(
                    180,
                    "Classic stir-fried rice with vegetables",
                    "https://www.indianhealthyrecipes.com/wp-content/uploads/2020/12/fried-rice.jpg"
                ),
                "Noodles" to DishInfo(170, "Stir-fried noodles with vegetables and sauce"),
                "Sushi Platter" to DishInfo(400, "Assorted sushi rolls with wasabi and soy sauce"),
                "Thai Green Curry" to DishInfo(
                    350,
                    "Spicy Thai curry with coconut milk and vegetables"
                ),
                "Teriyaki Chicken" to DishInfo(300, "Grilled chicken glazed with teriyaki sauce")
            ),
            "Desserts" to listOf(
                "Chocolate Lava Cake" to DishInfo(
                    180,
                    "Warm chocolate cake with molten center",
                    "https://5.imimg.com/data5/SELLER/Default/2024/5/416116214/ZW/QX/PC/132900754/chocolava-cake-500x500.jpeg"
                ),
                "Cheesecake" to DishInfo(200, "Creamy cheesecake with a biscuit base"),
                "Gulab Jamun" to DishInfo(150, "Soft deep-fried dumplings soaked in sugar syrup"),
                "Ice Cream Sundae" to DishInfo(
                    160,
                    "Vanilla ice cream with chocolate syrup and nuts"
                ),
                "Brownie" to DishInfo(170, "Fudgy chocolate brownie with nuts")
            ),
            "Pizzas" to listOf(
                "Margherita" to DishInfo(
                    250,
                    "Classic pizza with tomato, basil, and mozzarella",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNr7zUqgp12aK197H2CUHRibru1a7sM3RZKA&s"
                ),
                "Pepperoni" to DishInfo(300, "Pizza topped with pepperoni and cheese"),
                "Veggie Supreme" to DishInfo(280, "Loaded with mixed vegetables and cheese"),
                "BBQ Chicken" to DishInfo(320, "Grilled chicken with BBQ sauce and cheese"),
                "Paneer Tikka Pizza" to DishInfo(300, "Paneer cubes with Indian spices on pizza")
            ),
            "Burgers" to listOf(
                "Classic Veg Burger" to DishInfo(150, "Veg patty with lettuce, tomato, and sauce"),
                "Cheese Burger" to DishInfo(200, "Beef patty with cheese, lettuce, and tomato"),
                "Paneer Burger" to DishInfo(180, "Grilled paneer with sauces and veggies"),
                "Chicken Burger" to DishInfo(220, "Grilled chicken patty with cheese and veggies"),
                "Double Patty Burger" to DishInfo(250, "Two beef patties with cheese and sauces")
            ),
            "Cocktails" to listOf(
                "Mojito" to DishInfo(
                    250,
                    "Classic mint and lime cocktail",
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtwaP80FlMnpCynYz-Vu68aYlTL6lR1dJZ2A&s"
                ),
                "Margarita" to DishInfo(280, "Tequila-based cocktail with lime and salt"),
                "Cosmopolitan" to DishInfo(300, "Vodka, triple sec, cranberry juice, and lime"),
                "Pina Colada" to DishInfo(320, "Rum, coconut cream, and pineapple juice"),
                "Long Island Iced Tea" to DishInfo(350, "Mixed spirits with cola and lemon")
            ),
            "Beverages" to listOf(
                "Cold Coffee" to DishInfo(120, "Chilled coffee with milk and sugar"),
                "Lemonade" to DishInfo(100, "Refreshing lemon drink with mint"),
                "Masala Chai" to DishInfo(80, "Spiced Indian tea with milk"),
                "Orange Juice" to DishInfo(110, "Freshly squeezed orange juice"),
                "Smoothie" to DishInfo(150, "Mixed fruit smoothie with yogurt")
            )
        )
    }
}

