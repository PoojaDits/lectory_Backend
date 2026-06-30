import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('home-content')
@Controller()
export class HomeContentController {
  @Get('slides')
  @ApiOperation({ summary: 'Public: homepage hero slides' })
  getSlides() {
    return heroSlides;
  }

  @Get('categories')
  @ApiOperation({ summary: 'Public: homepage featured categories' })
  getCategories() {
    return categories;
  }

  @Get('newArrivals')
  @ApiOperation({ summary: 'Public: homepage new-arrival cards' })
  getNewArrivals() {
    return newArrivals;
  }

  @Get('testimonials')
  @ApiOperation({ summary: 'Public: homepage testimonials' })
  getTestimonials() {
    return testimonials;
  }

  @Get('preOrderBooks')
  @ApiOperation({ summary: 'Public: legacy homepage pre-order book cards' })
  getPreOrderBooks() {
    return preOrderBooks;
  }

  @Get('bestSellerBooks')
  @ApiOperation({ summary: 'Public: legacy homepage best-seller book cards' })
  getBestSellerBooks() {
    return bestSellerBooks;
  }

  @Get('recommendedBooks')
  @ApiOperation({ summary: 'Public: legacy homepage recommended book cards' })
  getRecommendedBooks() {
    return recommendedBooks;
  }

  @Get('mangaBooks')
  @ApiOperation({ summary: 'Public: legacy homepage manga book cards' })
  getMangaBooks() {
    return mangaBooks;
  }

  @Get('aiBooks')
  @ApiOperation({ summary: 'Public: legacy homepage AI book cards' })
  getAiBooks() {
    return aiBooks;
  }
}

const heroSlides = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/13278839/pexels-photo-13278839.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600',
    title: 'Discover Your Next\\nGreat Adventure',
    subtitle: 'Explore thousands of titles across every genre — from thrilling mysteries to heartfelt romances.',
    cta: 'Browse Collection',
    accent: 'from-primary-900/80 via-primary-900/50 to-transparent',
    ctaLink: '/browse',
    secondaryCta: 'Best Sellers',
    secondaryLink: '/browse?category=bestseller',
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/37247960/pexels-photo-37247960.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600',
    title: 'Cozy Up With\\nCurated Reads',
    subtitle: 'Handpicked recommendations from our curators. Find the stories that everyone is talking about.',
    cta: 'Browse Collection',
    accent: 'from-stone-900/80 via-stone-900/50 to-transparent',
    ctaLink: '/browse?category=recommended',
    secondaryCta: 'Learn More',
    secondaryLink: '/browse',
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/19015217/pexels-photo-19015217.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600',
    title: 'New Arrivals\\nEvery Week',
    subtitle: 'Stay ahead of the curve with fresh releases and exclusive pre-orders delivered to your door.',
    cta: 'Shop New Arrivals',
    accent: 'from-secondary-900/80 via-secondary-900/50 to-transparent',
    ctaLink: '/browse?category=preorder',
    secondaryCta: 'Browse All',
    secondaryLink: '/browse',
  },
];

const categories = [
  { id: 1, name: 'Best Sellers', count: '120+ books', icon: '🏆', gradient: 'from-amber-100 to-orange-100', shadow: 'shadow-amber-100', bg: 'bg-amber-50' },
  { id: 2, name: 'Recommended', count: '90+ books', icon: '✨', gradient: 'from-violet-100 to-fuchsia-100', shadow: 'shadow-violet-100', bg: 'bg-violet-50' },
  { id: 3, name: 'Manga', count: '75+ books', icon: '🎌', gradient: 'from-rose-100 to-pink-100', shadow: 'shadow-rose-100', bg: 'bg-rose-50' },
  { id: 4, name: 'AI & Tech', count: '60+ books', icon: '🤖', gradient: 'from-cyan-100 to-blue-100', shadow: 'shadow-cyan-100', bg: 'bg-cyan-50' },
];

const newArrivals = [
  { id: 1, title: 'The Midnight Library', author: 'Matt Haig', price: 399, image: 'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=340' },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', price: 499, image: 'https://images.pexels.com/photos/1005324/pexels-photo-1005324.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=340' },
  { id: 3, title: 'Project Hail Mary', author: 'Andy Weir', price: 429, image: 'https://images.pexels.com/photos/327482/pexels-photo-327482.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=340' },
];

const testimonials = [
  { id: 1, name: 'Sarah Johnson', role: 'Avid Reader', avatar: '👩‍💼', rating: 5, text: 'Lectory has completely transformed my reading experience. The recommendations are spot-on.' },
  { id: 2, name: 'Michael Chen', role: 'Book Club Leader', avatar: '👨‍🏫', rating: 5, text: 'The selection is excellent and marketplace sellers keep prices competitive.' },
  { id: 3, name: 'Emma Williams', role: 'Literature Student', avatar: '👩‍🎓', rating: 5, text: 'I found editions I could not find anywhere else. Highly recommended!' },
];

const preOrderBooks = [
  { id: 101, title: 'The Winds of Winter', author: 'George R. R. Martin', price: 799, originalPrice: 999, image: 'https://images.pexels.com/photos/159711/book-pages-open-pages-159711.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=340', badge: 'Pre Order', badgeColor: 'bg-primary-100 text-primary-800' },
  { id: 102, title: 'Sunrise on the Reaping', author: 'Suzanne Collins', price: 599, originalPrice: 799, image: 'https://images.pexels.com/photos/5904932/pexels-photo-5904932.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=340', badge: 'Coming Soon', badgeColor: 'bg-orange-100 text-orange-800' },
];

const bestSellerBooks = [
  { id: 201, title: 'Atomic Habits', author: 'James Clear', price: 499, originalPrice: 799, rating: 4.9, image: 'https://images.pexels.com/photos/1005324/pexels-photo-1005324.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=340', badge: 'Best Seller', badgeColor: 'bg-amber-100 text-amber-800' },
  { id: 202, title: 'The Psychology of Money', author: 'Morgan Housel', price: 349, originalPrice: 499, rating: 4.8, image: 'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=340', badge: 'Popular', badgeColor: 'bg-teal-100 text-teal-800' },
];

const recommendedBooks = [
  { id: 301, title: 'Project Hail Mary', author: 'Andy Weir', price: 429, originalPrice: 699, rating: 4.7, image: 'https://images.pexels.com/photos/327482/pexels-photo-327482.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=340', badge: 'Recommended', badgeColor: 'bg-violet-100 text-violet-800' },
  { id: 302, title: 'The Alchemist', author: 'Paulo Coelho', price: 249, originalPrice: 399, rating: 4.8, image: 'https://images.pexels.com/photos/897633/pexels-photo-897633.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=340', badge: 'Recommended', badgeColor: 'bg-primary-100 text-primary-800' },
];

const mangaBooks = [
  { id: 401, title: 'One Piece Vol. 101', author: 'Eiichiro Oda', price: 299, originalPrice: 399, image: 'https://images.pexels.com/photos/5904932/pexels-photo-5904932.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=340', badge: 'Manga', badgeColor: 'bg-blue-100 text-blue-800' },
  { id: 402, title: 'Demon Slayer Vol. 23', author: 'Koyoharu Gotouge', price: 319, originalPrice: 419, image: 'https://images.pexels.com/photos/159711/book-pages-open-pages-159711.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=340', badge: 'Manga', badgeColor: 'bg-rose-100 text-rose-800' },
];

const aiBooks = [
  { id: 501, title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', price: 899, originalPrice: 1099, rating: 4.9, image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=340', badge: 'AI', badgeColor: 'bg-secondary-100 text-secondary-800' },
  { id: 502, title: 'Deep Learning', author: 'Ian Goodfellow', price: 799, originalPrice: 999, rating: 4.8, image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=340', badge: 'AI', badgeColor: 'bg-cyan-100 text-cyan-800' },
];
