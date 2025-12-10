/**
 * Images constants of the application.
 *
 * This constant contains all the image paths used in the application.
 * It centralizes image management for better maintainability.
 *
 * @constant
 * @type {Object}
 */
export const APP_IMAGES = {
    // Logo
    logo: {
        main: "/image_logo_site/_1.png",

    },

  
    // Avatar images
    avatar: {
        avatar1: "/image_avatar/_1.png",
        avatar2: "/image_avatar/_2.png",
        avatar3: "/image_avatar/_3.png",
        avatar4: "/image_avatar/_4.png",
    },

    // Hero carousel images
    heroCarousel: {
        slide1: "/image_hero_carousel/_1.jpg",
        slide2: "/image_hero_carousel/_2.jpg",
        slide3: "/image_hero_carousel/_3.jpg",
    },

    // Before & After images
    beforeAfter: {
        image1: "/images_before_after/_1.jpg",
        image2: "/images_before_after/_2.jpg",
        image3: "/images_before_after/_3.jpg",
        image4: "/images_before_after/_4.jpg",
        image5: "/images_before_after/_5.jpg",
        image6: "/images_before_after/_6.jpg",
        image7: "/images_before_after/_7.jpg",
    },

    // Dropdown menu images
    drownMenu: {
        image1: "/images_drown_menu/_1.jpg",
    },

    // Auth pages backgrounds (utilise les images du carousel)
    auth: {
        loginBackground: "/image_hero_carousel/_2.jpg",
        registerBackground: "/image_hero_carousel/_3.jpg",
        forgotPasswordBackground: "/image_hero_carousel/_1.jpg",
        resetPasswordBackground: "/image_hero_carousel/_2.jpg",
        otpBackground: "/image_hero_carousel/_3.jpg",
    },
} as const;

/**
 * Type helper pour obtenir tous les chemins d'images de l'application
 */
export type AppImagesType = typeof APP_IMAGES;
