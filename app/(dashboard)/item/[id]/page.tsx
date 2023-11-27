import ItemCard from '@/components/ItemCard';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

const DisplayItemDetails = async ({ params }: { params: { id: string } }) => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from('items')
      .select()
      .eq('id', params.id);

    if (error || !data || data.length === 0) {
      throw new Error('Error fetching data');
    } else {
      const itemData = data[0];
      console.log(itemData);
      return (
        <>
          <ItemCard
            img='/TO BE ADDED'
            title={itemData.item_name}
            size={itemData.size}
            donor={itemData.donated_by}
            location={itemData.postcode}
            postageCovered={itemData.postable}
            link='TO BE ADDED'
          />
        </>
      );
    }
  } catch {}
};

export default DisplayItemDetails;
