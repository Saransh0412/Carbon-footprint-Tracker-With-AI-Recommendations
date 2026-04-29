"""
Carbon Calculation Service
Contains formulas for calculating carbon emissions from various activities
"""

class CarbonCalculator:
    """Calculate carbon emissions using standard formulas"""
    
    # Emission factors (kg CO2)
    EMISSION_FACTORS = {
        # Transportation (per km)
        'car_petrol': 0.12,
        'car_diesel': 0.15,
        'bus': 0.089,
        'train': 0.041,
        'flight_short': 0.255,
        'flight_long': 0.195,
        'motorcycle': 0.103,
        
        # Energy (per kWh)
        'electricity': 0.5,
        'natural_gas': 0.185,  # per kWh
        'heating_oil': 0.258,  # per liter
        
        # Diet (per meal/item)
        'beef_meal': 6.0,
        'pork_meal': 3.5,
        'chicken_meal': 1.9,
        'fish_meal': 1.6,
        'vegetarian_meal': 1.5,
        'vegan_meal': 0.9,
        
        # Consumption (estimates)
        'shopping_clothes': 10.0,  # per item
        'electronics_small': 50.0,  # per item
        'electronics_large': 200.0,  # per item
    }
    
    @staticmethod
    def calculate_transportation(vehicle_type, distance_km):
        """
        Calculate emissions from transportation
        
        Args:
            vehicle_type: Type of vehicle (car_petrol, bus, flight_short, etc.)
            distance_km: Distance traveled in kilometers
            
        Returns:
            float: CO2 emissions in kg
        """
        factor = CarbonCalculator.EMISSION_FACTORS.get(vehicle_type, 0.12)
        return distance_km * factor
    
    @staticmethod
    def calculate_energy(energy_type, amount):
        """
        Calculate emissions from energy use
        
        Args:
            energy_type: Type of energy (electricity, natural_gas, etc.)
            amount: Amount consumed (kWh for electricity/gas, liters for oil)
            
        Returns:
            float: CO2 emissions in kg
        """
        factor = CarbonCalculator.EMISSION_FACTORS.get(energy_type, 0.5)
        return amount * factor
    
    @staticmethod
    def calculate_diet(meal_type, count=1):
        """
        Calculate emissions from food consumption
        
        Args:
            meal_type: Type of meal (beef_meal, vegetarian_meal, etc.)
            count: Number of meals
            
        Returns:
            float: CO2 emissions in kg
        """
        factor = CarbonCalculator.EMISSION_FACTORS.get(meal_type, 1.5)
        return count * factor
    
    @staticmethod
    def calculate_consumption(item_type, count=1):
        """
        Calculate emissions from consumption/shopping
        
        Args:
            item_type: Type of item purchased
            count: Number of items
            
        Returns:
            float: CO2 emissions in kg
        """
        factor = CarbonCalculator.EMISSION_FACTORS.get(item_type, 10.0)
        return count * factor
    
    @staticmethod
    def calculate_generic(activity_data):
        """
        Generic calculation based on activity data
        
        Args:
            activity_data: Dictionary with activity details
            {
                'category': 'transportation|energy|diet|consumption',
                'type': specific type,
                'amount': amount/distance/count
            }
            
        Returns:
            float: CO2 emissions in kg
        """
        category = activity_data.get('category', '').lower()
        activity_type = activity_data.get('type', '')
        amount = float(activity_data.get('amount', 0))
        
        if category == 'transportation':
            return CarbonCalculator.calculate_transportation(activity_type, amount)
        elif category == 'energy':
            return CarbonCalculator.calculate_energy(activity_type, amount)
        elif category == 'diet':
            return CarbonCalculator.calculate_diet(activity_type, amount)
        elif category == 'consumption':
            return CarbonCalculator.calculate_consumption(activity_type, amount)
        else:
            return  0.0
