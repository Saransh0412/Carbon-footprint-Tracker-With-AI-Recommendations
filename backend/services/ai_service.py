"""
AI Service using Hugging Face Inference API
Generates personalized carbon reduction recommendations
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

class AIService:
    """Generate AI-powered recommendations using Hugging Face"""
    
    def __init__(self):
        self.api_token = os.getenv('HF_API_TOKEN')
        self.api_url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
        self.headers = {"Authorization": f"Bearer {self.api_token}"}
    
    def generate_recommendations(self, user_stats):
        """
        Generate personalized recommendations based on user's emission patterns
        
        Args:
            user_stats: Dictionary containing user's emission statistics
            {
                'total_emissions': float,
                'breakdown': {'transportation': X, 'energy': Y, 'diet': Z, 'consumption': W},
                'top_category': string
            }
            
        Returns:
            list: List of personalized recommendations
        """
        if not self.api_token or self.api_token == 'your_hugging_face_token_here':
            # Return default recommendations if no API token
            return self._get_default_recommendations(user_stats)
        
        try:
            # Create a prompt for the AI model
            prompt = self._create_prompt(user_stats)
            
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 250,
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "do_sample": True
                }
            }
            
            response = requests.post(self.api_url, headers=self.headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    generated_text = result[0].get('generated_text', '')
                    # Extract recommendations from generated text
                    recommendations = self._parse_recommendations(generated_text, prompt)
                    return recommendations if recommendations else self._get_default_recommendations(user_stats)
                else:
                    return self._get_default_recommendations(user_stats)
            else:
                print(f"Hugging Face API error: {response.status_code}")
                return self._get_default_recommendations(user_stats)
                
        except Exception as e:
            print(f"Error generating AI recommendations: {str(e)}")
            return self._get_default_recommendations(user_stats)
    
    def _create_prompt(self, user_stats):
        """Create a prompt for the AI model based on user statistics"""
        total = user_stats.get('total_emissions', 0)
        breakdown = user_stats.get('breakdown', {})
        
        prompt = f"""You are an environmental consultant. Based on this carbon footprint data, provide 3-5 specific, actionable recommendations to reduce emissions.

Carbon Emissions (kg CO2):
- Total: {total:.2f} kg
- Transportation: {breakdown.get('transportation', 0):.2f} kg
- Energy: {breakdown.get('energy', 0):.2f} kg
- Diet: {breakdown.get('diet', 0):.2f} kg
- Consumption: {breakdown.get('consumption', 0):.2f} kg

Provide numbered, specific recommendations:"""
        
        return prompt
    
    def _parse_recommendations(self, generated_text, prompt):
        """Parse AI-generated text into a list of recommendations"""
        # Remove the prompt from the generated text
        recommendations_text = generated_text.replace(prompt, '').strip()
        
        # Split by numbered items
        lines = recommendations_text.split('\n')
        recommendations = []
        
        for line in lines:
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
                # Clean up the recommendation
                rec = line.lstrip('0123456789.-•) ').strip()
                if len(rec) > 10:  # Filter out very short lines
                    recommendations.append(rec)
        
        # Limit to 5 recommendations
        return recommendations[:5] if recommendations else []
    
    def _get_default_recommendations(self, user_stats):
        """Provide default recommendations based on user's top emission category"""
        breakdown = user_stats.get('breakdown', {})
        total = user_stats.get('total_emissions', 0)
        
        # Find top category
        top_category = max(breakdown, key=breakdown.get) if breakdown else 'transportation'
        top_amount = breakdown.get(top_category, 0)
        
        recommendations = []
        
        # General recommendation
        if total > 100:
            recommendations.append("Your carbon footprint is significant. Small changes in daily habits can make a big difference!")
        elif total > 50:
            recommendations.append("You're doing okay, but there's room for improvement in reducing your carbon footprint.")
        else:
            recommendations.append("Great job! You're maintaining a relatively low carbon footprint. Keep it up!")
        
        # Category-specific recommendations
        if top_category == 'transportation' and top_amount > 20:
            recommendations.extend([
                "Consider carpooling, using public transportation, or cycling for short distances",
                "Combine multiple errands into one trip to reduce driving",
                "If possible, work from home a few days a week to cut commute emissions"
            ])
        elif top_category == 'energy' and top_amount > 15:
            recommendations.extend([
                "Switch to LED bulbs and unplug devices when not in use",
                "Adjust your thermostat by 2-3 degrees to save energy",
                "Consider using renewable energy sources or energy-efficient appliances"
            ])
        elif top_category == 'diet' and top_amount > 20:
            recommendations.extend([
                "Try incorporating more plant-based meals into your diet",
                "Reduce beef consumption - it has the highest carbon footprint",
                "Buy local and seasonal produce to reduce transportation emissions"
            ])
        elif top_category == 'consumption' and top_amount > 15:
            recommendations.extend([
                "Buy second-hand items when possible instead of new products",
                "Reduce, reuse, and recycle to minimize waste",
                "Choose products with minimal packaging and longer lifespans"
            ])
        
        # Add general tips if we need more recommendations
        if len(recommendations) < 4:
            recommendations.extend([
                "Track your emissions regularly to identify patterns and opportunities",
                "Set monthly carbon reduction goals and celebrate when you achieve them"
            ])
        
        return recommendations[:5]
